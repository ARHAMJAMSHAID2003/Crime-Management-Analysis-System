import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { analyticsAPI } from '../../services/api';
import './Crimes.css';

const Analytics = () => {
  const [trends, setTrends] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [officerPerformance, setOfficerPerformance] = useState([]);
  const [crimePatterns, setCrimePatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [filters, setFilters] = useState({
    year: '',
    month: '',
    limit: 10,
  });

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [trendsRes, hotspotsRes, statsRes, patternsRes] = await Promise.all([
        analyticsAPI.getTrends(filters).catch(() => ({ data: [] })),
        analyticsAPI.getHotspots().catch(() => ({ data: [] })),
        analyticsAPI.getStatistics().catch(() => ({ data: { categoryDistribution: [], officerPerformance: [] } })),
        analyticsAPI.getPatterns().catch(() => ({ data: [] })),
      ]);

      setTrends(trendsRes.data || []);
      setHotspots(hotspotsRes.data || []);
      setCategoryDistribution(statsRes.data?.categoryDistribution || []);
      setOfficerPerformance(statsRes.data?.officerPerformance || []);
      setCrimePatterns(patternsRes.data || []);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to load analytics',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    loadAnalytics();
  };

  const clearFilters = () => {
    setFilters({ year: '', month: '', limit: 10 });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Violent': '#f8d7da',
      'Property': '#fff3cd',
      'Cyber': '#d1ecf1',
      'White_Collar': '#e2e3e5',
      'Drug_Related': '#f5c6cb',
      'Other': '#d4edda',
    };
    return colors[category] || '#e9ecef';
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return '#ffd700'; // Gold
    if (rank === 2) return '#c0c0c0'; // Silver
    if (rank === 3) return '#cd7f32'; // Bronze
    return '#e9ecef';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="crimes-container">
      <div className="page-header">
        <h2 className="page-title">📊 Crime Analytics Dashboard</h2>
        <button className="btn btn-primary" onClick={loadAnalytics} title="Refresh analytics data">
          🔄 Refresh Data
        </button>
      </div>

      {/* Filter Section */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>🔍 Filters</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={applyFilters} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '5px 15px' }}>
              Apply Filters
            </button>
            <button onClick={clearFilters} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '5px 15px' }}>
              Clear
            </button>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>Year</label>
            <input
              type="number"
              min="2020"
              max={new Date().getFullYear()}
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              placeholder="All years"
              style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>Month</label>
            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            >
              <option value="">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>Hotspot Limit</label>
            <input
              type="number"
              min="5"
              max="50"
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            />
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px', 
        borderBottom: '2px solid #e9ecef',
        flexWrap: 'wrap'
      }}>
        {['overview', 'trends', 'hotspots', 'patterns', 'performance'].map(view => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            style={{
              padding: '10px 20px',
              background: activeView === view ? '#007bff' : 'transparent',
              color: activeView === view ? 'white' : '#495057',
              border: 'none',
              borderBottom: activeView === view ? '3px solid #007bff' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: activeView === view ? 'bold' : 'normal',
              fontSize: '0.95rem',
            }}
          >
            {view === 'overview' ? '📊 Overview' :
             view === 'trends' ? '📈 Trends' :
             view === 'hotspots' ? '🗺️ Hotspots' :
             view === 'patterns' ? '📅 Patterns' :
             '👮 Performance'}
          </button>
        ))}
      </div>

      {/* Overview View */}
      {activeView === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* Category Distribution Card */}
          {categoryDistribution.length > 0 && (
            <div className="table-container">
              <h3 style={{ padding: '15px', margin: 0, borderBottom: '1px solid #e9ecef', background: '#f8f9fa' }}>
                📈 Category Distribution
              </h3>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Category</th>
                      <th>Total Crimes</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryDistribution.map((row, idx) => {
                      const category = row.CATEGORY || row.Category || row.category;
                      const total = row.TOTAL_CRIMES || row.Total_Crimes || row.total_crimes;
                      const percentage = row.PERCENTAGE || row.Percentage || row.percentage;
                      const rank = row.CATEGORY_RANK || row.Category_Rank || row.category_rank || idx + 1;
                      
                      return (
                        <tr key={idx}>
                          <td>
                            <span style={{
                              background: getRankBadgeColor(rank),
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                              fontSize: '0.9rem',
                            }}>
                              #{rank}
                            </span>
                          </td>
                          <td>
                            <span style={{ 
                              background: getCategoryColor(category), 
                              padding: '4px 8px', 
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              fontWeight: '500',
                            }}>
                              {category || 'N/A'}
                            </span>
                          </td>
                          <td><strong>{total || 0}</strong></td>
                          <td>{percentage ? `${percentage}%` : 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Crime Hotspots Summary */}
          {hotspots.length > 0 && (
            <div className="table-container">
              <h3 style={{ padding: '15px', margin: 0, borderBottom: '1px solid #e9ecef', background: '#f8f9fa' }}>
                🗺️ Top Crime Hotspots
              </h3>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Location</th>
                      <th>Crimes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotspots.slice(0, 5).map((hotspot, idx) => {
                      const city = hotspot.CITY || hotspot.City || hotspot.city;
                      const area = hotspot.AREA || hotspot.Area || hotspot.area;
                      const total = hotspot.TOTAL_CRIMES || hotspot.Total_Crimes || hotspot.total_crimes;
                      const rank = hotspot.CRIME_RANK || hotspot.Crime_Rank || idx + 1;
                      
                      return (
                        <tr key={idx}>
                          <td>
                            <span style={{
                              background: getRankBadgeColor(rank),
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                            }}>
                              #{rank}
                            </span>
                          </td>
                          <td>
                            {city}{area ? `, ${area}` : ''}
                          </td>
                          <td>
                            <span style={{ 
                              background: '#f8d7da', 
                              padding: '4px 8px', 
                              borderRadius: '4px',
                              fontWeight: 'bold'
                            }}>
                              {total || 0}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trends View */}
      {activeView === 'trends' && (
        trends.length > 0 ? (
        <div className="table-container">
          <h3 style={{ padding: '15px', margin: 0, borderBottom: '1px solid #e9ecef', background: '#f8f9fa' }}>
            📈 Crime Trends (Month-over-Month)
          </h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Crime Type</th>
                  <th>Year</th>
                  <th>Month</th>
                  <th>Total Crimes</th>
                  <th>Cumulative</th>
                  <th>MoM Change</th>
                </tr>
              </thead>
              <tbody>
                {trends.map((row, idx) => {
                  const crimeType = row.CRIME_TYPE || row.Crime_Type || row.crime_type;
                  const year = row.YEAR || row.Year || row.year;
                  const month = row.MONTH || row.Month || row.month;
                  const total = row.TOTAL_CRIMES || row.Total_Crimes || row.total_crimes;
                  const cumulative = row.CUMULATIVE_CRIMES || row.Cumulative_Crimes || row.cumulative_crimes;
                  const change = row.MONTH_OVER_MONTH_CHANGE || row.Month_Over_Month_Change || row.month_over_month_change;
                  
                  return (
                    <tr key={idx}>
                      <td><strong>{crimeType}</strong></td>
                      <td>{year}</td>
                      <td>{month}</td>
                      <td>{total || 0}</td>
                      <td>{cumulative || 0}</td>
                      <td>
                        {change !== null && change !== undefined ? (
                          <span style={{ 
                            color: change > 0 ? '#d9534f' : change < 0 ? '#5cb85c' : '#6c757d',
                            fontWeight: 'bold'
                          }}>
                            {change > 0 ? '↑' : change < 0 ? '↓' : '='} {Math.abs(change)}%
                          </span>
                        ) : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📈</div>
            <p style={{ fontWeight: '500' }}>No trend data available yet.</p>
            <p style={{ fontSize: '14px' }}>Add crimes with dates to see month-over-month trend analysis.</p>
          </div>
        )
      )}

      {/* Hotspots View */}
      {activeView === 'hotspots' && (
        hotspots.length > 0 ? (
        <div className="table-container">
          <h3 style={{ padding: '15px', margin: 0, borderBottom: '1px solid #e9ecef', background: '#f8f9fa' }}>
            🗺️ Crime Hotspots (Detailed)
          </h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Location ID</th>
                  <th>City</th>
                  <th>Area</th>
                  <th>Street</th>
                  <th>Total Crimes</th>
                  <th>Solved</th>
                  <th>Solve Rate</th>
                </tr>
              </thead>
              <tbody>
                {hotspots.map((hotspot, idx) => {
                  const locationId = hotspot.LOCATION_ID || hotspot.Location_ID || hotspot.location_id;
                  const city = hotspot.CITY || hotspot.City || hotspot.city;
                  const area = hotspot.AREA || hotspot.Area || hotspot.area;
                  const street = hotspot.STREET || hotspot.Street || hotspot.street;
                  const total = hotspot.TOTAL_CRIMES || hotspot.Total_Crimes || hotspot.total_crimes;
                  const solved = hotspot.SOLVED_CASES || hotspot.Solved_Cases || hotspot.solved_cases;
                  const solveRate = hotspot.SOLVE_RATE || hotspot.Solve_Rate || hotspot.solve_rate;
                  const rank = hotspot.CRIME_RANK || hotspot.Crime_Rank || idx + 1;
                  
                  return (
                    <tr key={idx}>
                      <td>
                        <span style={{
                          background: getRankBadgeColor(rank),
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                        }}>
                          #{rank}
                        </span>
                      </td>
                      <td>
                        <span style={{ background: '#e3f2fd', padding: '4px 8px', borderRadius: '4px' }}>
                          #{locationId}
                        </span>
                      </td>
                      <td>{city || 'N/A'}</td>
                      <td>{area || 'N/A'}</td>
                      <td>{street || 'N/A'}</td>
                      <td>
                        <span style={{ background: '#f8d7da', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                          {total || 0}
                        </span>
                      </td>
                      <td>{solved || 0}</td>
                      <td>
                        <span style={{ 
                          background: solveRate >= 70 ? '#d4edda' : solveRate >= 40 ? '#fff3cd' : '#f8d7da',
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>
                          {solveRate ? `${solveRate}%` : '0%'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🗺️</div>
            <p style={{ fontWeight: '500' }}>No hotspot data available yet.</p>
            <p style={{ fontSize: '14px' }}>Add crimes with location data to see crime hotspots.</p>
          </div>
        )
      )}

      {/* Patterns View */}
      {activeView === 'patterns' && (
        crimePatterns.length > 0 ? (
        <div className="table-container">
          <h3 style={{ padding: '15px', margin: 0, borderBottom: '1px solid #e9ecef', background: '#f8f9fa' }}>
            📅 Crime Patterns by Day of Week
          </h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Crime Type</th>
                  <th>Day of Week</th>
                  <th>Total Incidents</th>
                  <th>Avg Hour</th>
                  <th>Day Rank</th>
                </tr>
              </thead>
              <tbody>
                {crimePatterns.map((row, idx) => {
                  const crimeType = row.CRIME_TYPE || row.Crime_Type || row.crime_type;
                  const dayOfWeek = row.DAY_OF_WEEK || row.Day_Of_Week || row.day_of_week;
                  const total = row.TOTAL_INCIDENTS || row.Total_Incidents || row.total_incidents;
                  const avgHour = row.AVG_HOUR_OF_DAY || row.Avg_Hour_Of_Day || row.avg_hour_of_day;
                  const dayRank = row.DAY_RANK || row.Day_Rank || row.day_rank;
                  
                  return (
                    <tr key={idx}>
                      <td><strong>{crimeType}</strong></td>
                      <td>{dayOfWeek || 'N/A'}</td>
                      <td>{total || 0}</td>
                      <td>{avgHour ? `${Math.round(avgHour)}:00` : 'N/A'}</td>
                      <td>
                        <span style={{
                          background: getRankBadgeColor(dayRank),
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          fontSize: '0.85rem'
                        }}>
                          #{dayRank}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📅</div>
            <p style={{ fontWeight: '500' }}>No pattern data available yet.</p>
            <p style={{ fontSize: '14px' }}>Add crimes with time information to see day-of-week patterns.</p>
          </div>
        )
      )}

      {/* Performance View */}
      {activeView === 'performance' && (
        officerPerformance.length > 0 ? (
        <div className="table-container">
          <h3 style={{ padding: '15px', margin: 0, borderBottom: '1px solid #e9ecef', background: '#f8f9fa' }}>
            👮 Officer Performance Rankings
          </h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Officer ID</th>
                  <th>Officer Name</th>
                  <th>Total Crimes</th>
                  <th>Solved</th>
                  <th>Solve Rate</th>
                  <th>Investigations</th>
                </tr>
              </thead>
              <tbody>
                {officerPerformance.map((row, idx) => {
                  const officerId = row.OFFICER_ID || row.Officer_ID || row.officer_id;
                  const officerName = row.OFFICER_NAME || row.Officer_Name || row.officer_name;
                  const total = row.TOTAL_CRIMES_ASSIGNED || row.Total_Crimes_Assigned || row.total_crimes_assigned;
                  const solved = row.SOLVED_CRIMES || row.Solved_Crimes || row.solved_crimes;
                  const solveRate = row.SOLVE_RATE || row.Solve_Rate || row.solve_rate;
                  const investigations = row.INVESTIGATIONS_LEAD || row.Investigations_Lead || row.investigations_lead;
                  const rank = row.PERFORMANCE_RANK || row.Performance_Rank || row.performance_rank || idx + 1;
                  
                  return (
                    <tr key={idx}>
                      <td>
                        <span style={{
                          background: getRankBadgeColor(rank),
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                        }}>
                          #{rank}
                        </span>
                      </td>
                      <td>
                        <span style={{ background: '#e3f2fd', padding: '4px 8px', borderRadius: '4px' }}>
                          #{officerId}
                        </span>
                      </td>
                      <td><strong>{officerName}</strong></td>
                      <td>{total || 0}</td>
                      <td>
                        <span style={{ background: '#d4edda', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                          {solved || 0}
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          background: solveRate >= 70 ? '#d4edda' : solveRate >= 40 ? '#fff3cd' : '#f8d7da',
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>
                          {solveRate ? `${solveRate}%` : '0%'}
                        </span>
                      </td>
                      <td>{investigations || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>👮</div>
            <p style={{ fontWeight: '500' }}>No officer performance data available yet.</p>
            <p style={{ fontSize: '14px' }}>Assign officers to investigations and crimes to see performance rankings.</p>
          </div>
        )
      )}

      {/* Empty State - Overview */}
      {activeView === 'overview' && 
       categoryDistribution.length === 0 && 
       hotspots.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
          <p style={{ fontWeight: '500' }}>No analytics data available yet.</p>
          <p style={{ fontSize: '14px' }}>Add crimes and investigations to start seeing analytics.</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;






