// Asteroids.jsx - Near Earth Objects Live Feed from NASA NeoWs API
import React, { useEffect, useState } from "react";

export default function Asteroids() {
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedDate, setSelectedDate] = useState('today');
  const [sortBy, setSortBy] = useState('distance'); // distance, size, velocity, hazard
  const [fetchInfo, setFetchInfo] = useState(null);

  useEffect(() => {
    fetchAsteroidData();
    fetchAsteroidStats();
  }, [selectedDate]);

  useEffect(() => {
    if (asteroids.length > 0) {
      sortAsteroids();
    }
  }, [sortBy, asteroids]);

  const fetchAsteroidData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`☄️ Fetching asteroid data for ${selectedDate}...`);
      
      const endpoint = selectedDate === 'today' 
        ? 'http://localhost:5000/api/asteroids/today'
        : `http://localhost:5000/api/asteroids/feed?start_date=${selectedDate}&end_date=${selectedDate}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.success) {
        setAsteroids(data.asteroids);
        setFetchInfo({
          totalCount: data.totalCount,
          dateRange: data.dateRange,
          fetchedAt: data.fetchedAt,
          source: data.source
        });
        console.log(`✅ Loaded ${data.asteroids.length} asteroids`);
      } else {
        throw new Error(data.error || 'Failed to fetch asteroid data');
      }
    } catch (err) {
      console.error('Error fetching asteroids:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAsteroidStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/asteroids/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.warn('Could not fetch asteroid statistics:', err);
    }
  };

  const sortAsteroids = () => {
    const sorted = [...asteroids].sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return parseFloat(a.missDistance.kilometers.replace(/,/g, '')) - 
                 parseFloat(b.missDistance.kilometers.replace(/,/g, ''));
        case 'size':
          return parseFloat(b.estimatedDiameter.kilometers.average) - 
                 parseFloat(a.estimatedDiameter.kilometers.average);
        case 'velocity':
          return parseFloat(b.relativeVelocity.kmPerHour.replace(/,/g, '')) - 
                 parseFloat(a.relativeVelocity.kmPerHour.replace(/,/g, ''));
        case 'hazard':
          return (b.isPotentiallyHazardous ? 1 : 0) - (a.isPotentiallyHazardous ? 1 : 0);
        default:
          return 0;
      }
    });
    setAsteroids(sorted);
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-blue-500';
      default: return 'bg-green-500';
    }
  };

  const getSizeIcon = (sizeCategory) => {
    switch (sizeCategory) {
      case 'LARGE': return '🪨';
      case 'MEDIUM': return '🌑';
      case 'SMALL': return '⚫';
      default: return '⚪';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4 w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-2xl font-poppins text-white mb-2">☄️ Scanning for Near Earth Objects...</h2>
          <p className="text-purple-300">Fetching live asteroid data from NASA NeoWs</p>
          <div className="mt-4 text-sm text-purple-400">
            🛰️ Real-time data • No cache
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">☄️</div>
          <h2 className="text-2xl font-poppins text-white mb-2">Oops! Asteroid scanner offline</h2>
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchAsteroidData}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Retry Scan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900/80 backdrop-blur-md border-b border-purple-500/20 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold font-poppins text-white mb-2">
                ☄️ Near Earth Asteroids — Live Feed from NASA NeoWs
              </h1>
              <p className="text-purple-300">
                {fetchInfo ? (
                  <>
                    Live from {fetchInfo.source} • {fetchInfo.totalCount} objects detected • 
                    <span className="text-green-400">⚡ Real-time</span>
                  </>
                ) : (
                  'Loading asteroid detection data...'
                )}
              </p>
              {fetchInfo && (
                <p className="text-xs text-purple-400 mt-1">
                  Last scan: {new Date(fetchInfo.fetchedAt).toLocaleTimeString()} • 
                  Date range: {fetchInfo.dateRange.start} to {fetchInfo.dateRange.end}
                </p>
              )}
            </div>
            
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Date Selection */}
              <div className="flex gap-2 bg-slate-800/50 p-2 rounded-xl">
                {[
                  { key: 'today', label: 'Today', icon: '📅' },
                  { key: new Date(Date.now() - 86400000).toISOString().split('T')[0], label: 'Yesterday', icon: '⏮️' },
                  { key: new Date(Date.now() + 86400000).toISOString().split('T')[0], label: 'Tomorrow', icon: '⏭️' }
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedDate(key)}
                    className={`
                      px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm
                      ${selectedDate === key 
                        ? 'bg-purple-600 text-white shadow-lg scale-105' 
                        : 'text-gray-400 hover:text-white hover:bg-slate-700'
                      }
                    `}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              
              {/* Sort Options */}
              <div className="flex gap-2 bg-slate-800/50 p-2 rounded-xl">
                {[
                  { key: 'distance', label: 'Distance', icon: '📏' },
                  { key: 'size', label: 'Size', icon: '📐' },
                  { key: 'velocity', label: 'Speed', icon: '⚡' },
                  { key: 'hazard', label: 'Risk', icon: '⚠️' }
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key)}
                    className={`
                      px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 text-sm
                      ${sortBy === key 
                        ? 'bg-blue-600 text-white shadow-lg scale-105' 
                        : 'text-gray-400 hover:text-white hover:bg-slate-700'
                      }
                    `}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Statistics Bar */}
          {stats && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.totalNearEarthObjects?.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Total NEOs Catalogued</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{asteroids.length}</div>
                <div className="text-sm text-gray-400">Today's Approaches</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-400">
                  {asteroids.filter(a => a.isPotentiallyHazardous).length}
                </div>
                <div className="text-sm text-gray-400">Potentially Hazardous</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {asteroids.filter(a => a.riskLevel === 'HIGH' || a.riskLevel === 'MEDIUM').length}
                </div>
                <div className="text-sm text-gray-400">High/Medium Risk</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Asteroids Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {asteroids.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌌</div>
            <h3 className="text-2xl font-bold text-white mb-2">No asteroids detected today</h3>
            <p className="text-gray-400">The skies are clear! Check back tomorrow for new approaches.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {asteroids.map((asteroid, index) => (
              <div
                key={asteroid.id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:transform hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Header */}
                <div className="p-4 border-b border-slate-700/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
                        {getSizeIcon(asteroid.sizeCategory)} {asteroid.name}
                      </h3>
                      <p className="text-sm text-purple-300">
                        ID: {asteroid.neoReferenceId}
                      </p>
                    </div>
                    
                    {/* Risk Badge */}
                    <div className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getRiskColor(asteroid.riskLevel)}`}>
                      {asteroid.riskLevel}
                    </div>
                  </div>
                  
                  {/* Hazardous Warning */}
                  {asteroid.isPotentiallyHazardous && (
                    <div className="mt-2 bg-red-500/20 border border-red-500/50 rounded-lg p-2 flex items-center gap-2">
                      <span className="text-red-400">⚠️</span>
                      <span className="text-red-300 text-sm font-medium">Potentially Hazardous Object</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Approach Date */}
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">📅</span>
                    <div>
                      <div className="text-sm text-gray-300">Close Approach</div>
                      <div className="text-white font-medium">
                        {formatDate(asteroid.closeApproachDateFull || asteroid.closeApproachDate)}
                      </div>
                    </div>
                  </div>

                  {/* Size */}
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">📐</span>
                    <div>
                      <div className="text-sm text-gray-300">Estimated Diameter</div>
                      <div className="text-white font-medium">
                        {asteroid.estimatedDiameter.kilometers.min} - {asteroid.estimatedDiameter.kilometers.max} km
                      </div>
                      <div className="text-xs text-gray-400">
                        (~{asteroid.estimatedDiameter.kilometers.average} km avg)
                      </div>
                    </div>
                  </div>

                  {/* Velocity */}
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">⚡</span>
                    <div>
                      <div className="text-sm text-gray-300">Relative Velocity</div>
                      <div className="text-white font-medium">
                        {asteroid.relativeVelocity.kmPerHour} km/h
                      </div>
                      <div className="text-xs text-gray-400">
                        ({asteroid.relativeVelocity.kmPerSecond} km/s)
                      </div>
                    </div>
                  </div>

                  {/* Miss Distance */}
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">📏</span>
                    <div>
                      <div className="text-sm text-gray-300">Miss Distance</div>
                      <div className="text-white font-medium">
                        {asteroid.missDistance.kilometers} km
                      </div>
                      <div className="text-xs text-gray-400">
                        ({asteroid.missDistance.lunar} lunar distances)
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="pt-2 border-t border-slate-700/50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">
                        Magnitude: {asteroid.absoluteMagnitude}
                      </span>
                      <span className="text-gray-400">
                        Orbiting: {asteroid.orbitingBody}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-900/30 border-t border-slate-700/50">
                  <a
                    href={asteroid.nasaJplUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
                  >
                    <span>View NASA JPL Details</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center mt-12">
          <button
            onClick={fetchAsteroidData}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="loading-spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Scanning Space...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                🔄 Refresh Asteroid Scan
              </span>
            )}
          </button>
          
          <p className="text-sm text-purple-400 mt-2">
            🛰️ Live data from NASA NeoWs API • Updated in real-time
          </p>
        </div>
      </div>
    </div>
  );
}
