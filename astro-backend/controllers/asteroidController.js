// astro-backend/controllers/asteroidController.js
// NASA NeoWs API controller for Near Earth Objects (Asteroids)

require('dotenv').config();
const axios = require('axios');

const NASA_API_KEY = process.env.NASA_API_KEY || '82UaaWb16aHlwhNRnMiDHULN5aXXr8Xu436wXcMd';
const NEOWS_BASE_URL = 'https://api.nasa.gov/neo/rest/v1';

// -------------------------------------------------------------------
// GET TODAY'S NEAR EARTH ASTEROIDS
// -------------------------------------------------------------------
exports.getTodaysAsteroids = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const startDate = req.query.start_date || today;
    const endDate = req.query.end_date || today;
    
    console.log(`🪐 Fetching NEO data for ${startDate} to ${endDate}...`);
    
    const response = await axios.get(`${NEOWS_BASE_URL}/feed`, {
      params: {
        start_date: startDate,
        end_date: endDate,
        api_key: NASA_API_KEY
      },
      timeout: 15000 // 15 second timeout
    });
    
    const data = response.data;
    const processedAsteroids = [];
    
    // Process asteroids from all dates in the response
    Object.keys(data.near_earth_objects).forEach(date => {
      const asteroidsForDate = data.near_earth_objects[date];
      
      asteroidsForDate.forEach(asteroid => {
        const processedAsteroid = processAsteroidData(asteroid, date);
        processedAsteroids.push(processedAsteroid);
      });
    });
    
    // Sort by closest approach distance (closest first)
    processedAsteroids.sort((a, b) => 
      parseFloat(a.missDistance.kilometers) - parseFloat(b.missDistance.kilometers)
    );
    
    console.log(`✅ Successfully processed ${processedAsteroids.length} asteroids`);
    
    res.json({
      success: true,
      asteroids: processedAsteroids,
      totalCount: processedAsteroids.length,
      dateRange: {
        start: startDate,
        end: endDate
      },
      fetchedAt: new Date().toISOString(),
      source: 'NASA NeoWs API'
    });
    
  } catch (error) {
    console.error('❌ Error fetching asteroid data:', error.message);
    
    // Handle specific API errors
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.message;
      
      return res.status(status).json({
        success: false,
        error: `NASA API Error: ${message}`,
        statusCode: status
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch asteroid data',
      details: error.message
    });
  }
};

// -------------------------------------------------------------------
// GET ASTEROID DETAILS BY ID
// -------------------------------------------------------------------
exports.getAsteroidById = async (req, res) => {
  try {
    const { asteroidId } = req.params;
    
    console.log(`🔍 Fetching detailed data for asteroid ${asteroidId}...`);
    
    const response = await axios.get(`${NEOWS_BASE_URL}/neo/${asteroidId}`, {
      params: {
        api_key: NASA_API_KEY
      },
      timeout: 10000
    });
    
    const asteroid = response.data;
    const processedData = processDetailedAsteroidData(asteroid);
    
    console.log(`✅ Successfully fetched details for ${asteroid.name}`);
    
    res.json({
      success: true,
      asteroid: processedData,
      fetchedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching asteroid details:', error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Asteroid not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch asteroid details',
      details: error.message
    });
  }
};

// -------------------------------------------------------------------
// GET ASTEROID STATISTICS
// -------------------------------------------------------------------
exports.getAsteroidStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    console.log(`📊 Fetching asteroid statistics for ${today}...`);
    
    const response = await axios.get(`${NEOWS_BASE_URL}/stats`, {
      params: {
        api_key: NASA_API_KEY
      },
      timeout: 10000
    });
    
    const stats = response.data;
    
    res.json({
      success: true,
      stats: {
        totalNearEarthObjects: stats.near_earth_object_count,
        totalCloseApproaches: stats.close_approach_count,
        lastUpdated: stats.last_updated,
        source: stats.source
      },
      fetchedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching asteroid statistics:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch asteroid statistics'
    });
  }
};

// -------------------------------------------------------------------
// PROCESS ASTEROID DATA FOR FRONTEND
// -------------------------------------------------------------------
function processAsteroidData(asteroid, approachDate) {
  const closeApproach = asteroid.close_approach_data[0] || {};
  const estimatedDiameter = asteroid.estimated_diameter;
  
  return {
    id: asteroid.id,
    name: asteroid.name,
    neoReferenceId: asteroid.neo_reference_id,
    
    // Approach information
    closeApproachDate: closeApproach.close_approach_date || approachDate,
    closeApproachDateFull: closeApproach.close_approach_date_full,
    
    // Size information
    estimatedDiameter: {
      kilometers: {
        min: estimatedDiameter?.kilometers?.estimated_diameter_min?.toFixed(3) || 'Unknown',
        max: estimatedDiameter?.kilometers?.estimated_diameter_max?.toFixed(3) || 'Unknown',
        average: estimatedDiameter?.kilometers ? 
          ((estimatedDiameter.kilometers.estimated_diameter_min + estimatedDiameter.kilometers.estimated_diameter_max) / 2).toFixed(3) : 'Unknown'
      },
      meters: {
        min: estimatedDiameter?.meters?.estimated_diameter_min?.toFixed(0) || 'Unknown',
        max: estimatedDiameter?.meters?.estimated_diameter_max?.toFixed(0) || 'Unknown'
      }
    },
    
    // Velocity and distance
    relativeVelocity: {
      kmPerHour: parseFloat(closeApproach.relative_velocity?.kilometers_per_hour || 0).toLocaleString(),
      kmPerSecond: parseFloat(closeApproach.relative_velocity?.kilometers_per_second || 0).toFixed(2)
    },
    
    missDistance: {
      kilometers: parseFloat(closeApproach.miss_distance?.kilometers || 0).toLocaleString(),
      lunar: parseFloat(closeApproach.miss_distance?.lunar || 0).toFixed(2),
      astronomical: parseFloat(closeApproach.miss_distance?.astronomical || 0).toFixed(6)
    },
    
    // Safety information
    isPotentiallyHazardous: asteroid.is_potentially_hazardous_asteroid,
    isSentryObject: asteroid.is_sentry_object || false,
    
    // Additional data
    absoluteMagnitude: asteroid.absolute_magnitude_h,
    orbitingBody: closeApproach.orbiting_body || 'Earth',
    
    // Calculated fields
    riskLevel: calculateRiskLevel(asteroid, closeApproach),
    sizeCategory: categorizeSizeByDiameter(estimatedDiameter?.kilometers?.estimated_diameter_max || 0),
    
    // Links
    nasaJplUrl: asteroid.nasa_jpl_url
  };
}

// -------------------------------------------------------------------
// PROCESS DETAILED ASTEROID DATA
// -------------------------------------------------------------------
function processDetailedAsteroidData(asteroid) {
  const basicData = processAsteroidData(asteroid, null);
  
  return {
    ...basicData,
    
    // Additional detailed information
    designation: asteroid.designation,
    discoveryDate: asteroid.orbital_data?.first_observation_date,
    lastObservation: asteroid.orbital_data?.last_observation_date,
    observationsUsed: asteroid.orbital_data?.observations_used,
    
    // Orbital characteristics
    orbitalData: {
      orbitId: asteroid.orbital_data?.orbit_id,
      orbitDeterminationDate: asteroid.orbital_data?.orbit_determination_date,
      orbitUncertainty: asteroid.orbital_data?.orbit_uncertainty,
      minimumOrbitIntersection: asteroid.orbital_data?.minimum_orbit_intersection,
      jupiterTisserandInvariant: asteroid.orbital_data?.jupiter_tisserand_invariant,
      epochOsculation: asteroid.orbital_data?.epoch_osculation,
      eccentricity: asteroid.orbital_data?.eccentricity,
      semiMajorAxis: asteroid.orbital_data?.semi_major_axis,
      inclination: asteroid.orbital_data?.inclination,
      ascendingNodeLongitude: asteroid.orbital_data?.ascending_node_longitude,
      orbitalPeriod: asteroid.orbital_data?.orbital_period,
      perihelionDistance: asteroid.orbital_data?.perihelion_distance,
      aphelionDistance: asteroid.orbital_data?.aphelion_distance,
      perihelionArgument: asteroid.orbital_data?.perihelion_argument,
      perihelionTime: asteroid.orbital_data?.perihelion_time,
      meanAnomaly: asteroid.orbital_data?.mean_anomaly,
      meanMotion: asteroid.orbital_data?.mean_motion
    },
    
    // All close approaches
    allCloseApproaches: asteroid.close_approach_data?.map(approach => ({
      date: approach.close_approach_date,
      dateFull: approach.close_approach_date_full,
      velocity: approach.relative_velocity,
      missDistance: approach.miss_distance,
      orbitingBody: approach.orbiting_body
    })) || []
  };
}

// -------------------------------------------------------------------
// HELPER FUNCTIONS
// -------------------------------------------------------------------
function calculateRiskLevel(asteroid, closeApproach) {
  const isPotentiallyHazardous = asteroid.is_potentially_hazardous_asteroid;
  const missDistanceKm = parseFloat(closeApproach.miss_distance?.kilometers || Infinity);
  const velocityKmH = parseFloat(closeApproach.relative_velocity?.kilometers_per_hour || 0);
  
  if (isPotentiallyHazardous) {
    if (missDistanceKm < 1000000) return 'HIGH'; // Less than 1M km
    if (missDistanceKm < 5000000) return 'MEDIUM'; // Less than 5M km
    return 'LOW';
  }
  
  if (missDistanceKm < 500000) return 'MEDIUM'; // Very close approach
  return 'MINIMAL';
}

function categorizeSizeByDiameter(diameterKm) {
  if (diameterKm >= 1) return 'LARGE'; // 1km+
  if (diameterKm >= 0.14) return 'MEDIUM'; // 140m+
  if (diameterKm >= 0.05) return 'SMALL'; // 50m+
  return 'TINY'; // Less than 50m
}

// -------------------------------------------------------------------
// GET DATE RANGE FOR ASTEROID LOOKUP
// -------------------------------------------------------------------
exports.getDateRange = async (req, res) => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    res.json({
      success: true,
      dates: {
        yesterday: yesterday.toISOString().split('T')[0],
        today: today.toISOString().split('T')[0],
        tomorrow: tomorrow.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate date range'
    });
  }
};
