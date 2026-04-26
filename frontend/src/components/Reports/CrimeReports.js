import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { crimeReportsAPI } from '../../services/api';
import Header from '../Dashboard/Header';
import './Reports.css';

const CrimeReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const arrestNotificationShown = useRef(false);
  const [formData, setFormData] = useState({
    crimeType: '',
    dateOccurred: '',
    dateReported: new Date().toISOString().split('T')[0],
    timeOccurred: '',
    severity: 'Moderate',
    description: '',
    city: '',
    area: '',
    street: '',
    reportedByName: '',
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await crimeReportsAPI.getMyReports();
      console.log('📋 Reports loaded:', response.data);
      const loadedReports = response.data || [];
      setReports(loadedReports);

      // Show arrest notification only for reports that NEWLY became Resolved (not yet seen)
      if (!arrestNotificationShown.current) {
        arrestNotificationShown.current = true;
        const seenKey = 'cpas_notified_resolved_ids';
        const alreadySeen = JSON.parse(localStorage.getItem(seenKey) || '[]');
        const resolvedReports = loadedReports.filter(r => (r.STATUS || r.status) === 'Resolved');
        const newlyResolved = resolvedReports.filter(r => {
          const id = r.REPORT_ID || r.report_id || r.id;
          return id && !alreadySeen.includes(id);
        });
        if (newlyResolved.length > 0) {
          const newIds = newlyResolved.map(r => r.REPORT_ID || r.report_id || r.id);
          localStorage.setItem(seenKey, JSON.stringify([...alreadySeen, ...newIds]));
          Swal.fire({
            icon: 'success',
            title: '🚔 Case Update',
            html: `<p>A suspect linked to your case has been <strong style="color:#28a745;">ARRESTED</strong>.</p>
                   <p style="color:#555; margin-top:8px;">Click <strong>View Details</strong> on your Resolved report to see arrest information.</p>`,
            confirmButtonText: 'View My Reports',
            confirmButtonColor: '#28a745'
          });
        }
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
      Swal.fire('Error!', error.message || 'Failed to load reports', 'error');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.crimeType || !formData.dateOccurred || !formData.description || !formData.city) {
      Swal.fire('Error!', 'Please fill in all required fields (Crime Type, Date Occurred, Description, City)', 'error');
      return;
    }
    
    try {
      const payload = {
        reportedByName: formData.reportedByName || null,
        reportDetails: `Crime Type: ${formData.crimeType}\nDate: ${formData.dateOccurred}${formData.timeOccurred ? ' ' + formData.timeOccurred : ''}\nLocation: ${formData.city}${formData.area ? ', ' + formData.area : ''}${formData.street ? ', ' + formData.street : ''}\nSeverity: ${formData.severity}\n\nDescription:\n${formData.description}`,
        reportStatus: 'Pending Review'
      };
      
      console.log('📤 Submitting report:', payload);
      await crimeReportsAPI.create(payload);
      
      Swal.fire({
        icon: 'success',
        title: 'Report Submitted!',
        text: 'Your crime report has been submitted successfully. We will review it shortly.',
        confirmButtonColor: '#3085d6'
      });
      
      setShowForm(false);
      setFormData({
        crimeType: '',
        dateOccurred: '',
        dateReported: new Date().toISOString().split('T')[0],
        timeOccurred: '',
        severity: 'Moderate',
        description: '',
        city: '',
        area: '',
        street: '',
        reportedByName: '',
      });
      loadReports();
    } catch (error) {
      console.error('Submit error:', error);
      Swal.fire('Error!', error.message || 'Failed to submit report', 'error');
    }
  };

  const handleViewDetails = async (reportId) => {
    try {
      console.log('🔍 Fetching report details for ID:', reportId);
      const response = await crimeReportsAPI.getById(reportId);
      console.log('📦 Response received:', response);
      const reportData = response.data;
      console.log('📋 Report data:', reportData);

      // Fetch suspect data for each linked crime to show arrest notifications
      if (reportData.linked_crimes && reportData.linked_crimes.length > 0) {
        // Suspects are now embedded directly from the backend (crime.SUSPECTS)
        // No extra API calls needed
        reportData.linked_crimes.forEach(crime => {
          if (!crime.SUSPECTS) crime.SUSPECTS = [];
        });
      }
      
      let detailsHtml = `
        <div style="text-align: left; max-height: 500px; overflow-y: auto;">
          <div style="margin-bottom: 20px;">
            <h4 style="color: #333; margin-bottom: 10px;">📋 Report Details</h4>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
              <p><strong>Report ID:</strong> ${reportData.report.REPORT_ID || reportData.report.report_id}</p>
              <p><strong>Date Reported:</strong> ${new Date(reportData.report.DATE_REPORTED || reportData.report.date_reported).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span style="color: ${
                (reportData.report.STATUS || reportData.report.status) === 'Resolved' ? 'green' : 
                (reportData.report.STATUS || reportData.report.status) === 'Under Investigation' ? 'orange' : '#666'
              };">${reportData.report.STATUS || reportData.report.status}</span></p>
              <p><strong>Reported By:</strong> ${reportData.report.REPORTED_BY || reportData.report.reported_by || reportData.report.VICTIM_NAME || reportData.report.victim_name || 'You'}</p>
              <p><strong>Report Type:</strong> ${reportData.report.REPORT_TYPE || reportData.report.report_type}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h4 style="color: #333; margin-bottom: 10px;">📝 Details</h4>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; white-space: pre-wrap;">
              ${reportData.report.DETAILS || reportData.report.details || 'No details provided'}
            </div>
          </div>
          
          ${reportData.linked_crimes && reportData.linked_crimes.length > 0 ? `
            <div style="margin-bottom: 20px;">
              <h4 style="color: #333; margin-bottom: 10px;">🔗 Linked Crimes (${reportData.total_linked_crimes})</h4>
              ${reportData.linked_crimes.map(crime => {
                const crimeId = crime.CRIME_ID || crime.crime_id;
                const crimeStatus = crime.CRIME_STATUS || crime.crime_status;
                const allSuspects = crime.SUSPECTS || [];
                const arrestedSuspects = allSuspects.filter(s => (s.Status || s.STATUS || s.status) === 'Arrested');
                const evidence = crime.EVIDENCE || [];

                const arrestedBanner = arrestedSuspects.length > 0
                  ? `<div style="background:#d4edda; padding:10px 12px; border-radius:6px; margin-bottom:8px; border-left:4px solid #28a745;">
                      <strong>🚨 Arrest Update:</strong> ${arrestedSuspects.map(s => `<strong>${s.Name || s.NAME}</strong> (${s.Role || s.ROLE || 'Suspect'}) has been <span style="color:#155724; font-weight:700;">ARRESTED</span>`).join(' &amp; ')}
                    </div>`
                  : '';

                const suspectsSection = allSuspects.length > 0
                  ? `<div style="background:#fff8e1; padding:10px 12px; border-radius:6px; margin-top:10px; border-left:4px solid #ffa000;">
                      <p style="margin:0 0 6px 0; font-weight:700; color:#e65100;">🕵️ Linked Suspects</p>
                      ${allSuspects.map(s => {
                        const st = s.Status || s.STATUS || s.status || 'Unknown';
                        const stColor = st === 'Arrested' ? '#155724' : st === 'At Large' ? '#721c24' : '#555';
                        return `<p style="margin:3px 0; font-size:0.9em;">• <strong>${s.Name || s.NAME}</strong> — Role: ${s.Role || s.ROLE} &nbsp;|&nbsp; Status: <span style="color:${stColor}; font-weight:600;">${st}</span></p>`;
                      }).join('')}
                    </div>`
                  : '';

                const evStatusColor = (st) => {
                  if (!st) return '#888';
                  if (['Released', 'Stored'].includes(st)) return '#2e7d32';
                  if (st === 'Analyzed') return '#1565c0';
                  if (st === 'Transferred') return '#e65100';
                  return '#555';
                };
                const evidenceSection = evidence.length > 0
                  ? `<div style="background:#f3e5f5; padding:10px 12px; border-radius:6px; margin-top:10px; border-left:4px solid #8e24aa;">
                      <p style="margin:0 0 8px 0; font-weight:700; color:#6a1b9a;">🔬 Evidence Collected (${evidence.length})</p>
                      <table style="width:100%; border-collapse:collapse; font-size:0.85em;">
                        <thead>
                          <tr style="background:#e1bee7;">
                            <th style="padding:4px 8px; text-align:left;">Type</th>
                            <th style="padding:4px 8px; text-align:left;">Collected By</th>
                            <th style="padding:4px 8px; text-align:left;">Date</th>
                            <th style="padding:4px 8px; text-align:left;">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${evidence.map(ev => `
                            <tr style="border-top:1px solid #ce93d8;">
                              <td style="padding:4px 8px;">${ev.type || 'Unknown'}</td>
                              <td style="padding:4px 8px;">${ev.collectedBy}</td>
                              <td style="padding:4px 8px;">${ev.dateCollected || '—'}</td>
                              <td style="padding:4px 8px; color:${evStatusColor(ev.currentStatus)}; font-weight:600;">${ev.currentStatus}</td>
                            </tr>`).join('')}
                        </tbody>
                      </table>
                    </div>`
                  : '';

                const inv = crime.INVESTIGATION;
                const invSection = inv ? `
                  <div style="background:#f0f4ff; padding:10px 12px; border-radius:6px; margin-top:10px; border-left:4px solid #5c6bc0;">
                    <p style="margin:0 0 6px 0; font-weight:700; color:#3949ab;">🔍 Investigation Details</p>
                    <p style="margin:2px 0;"><strong>Case Number:</strong> ${inv.caseNumber}</p>
                    <p style="margin:2px 0;"><strong>Lead Officer:</strong> ${inv.leadOfficer || 'Not assigned'}</p>
                    <p style="margin:2px 0;"><strong>Status:</strong> <span style="color:${inv.status === 'Closed' ? '#2e7d32' : inv.status === 'Suspended' ? '#e65100' : '#1565c0'}; font-weight:600;">${inv.status}</span></p>
                    <p style="margin:2px 0;"><strong>Outcome:</strong> <span style="color:${inv.outcome === 'Solved' ? '#2e7d32' : inv.outcome === 'Pending' ? '#f57c00' : '#666'}; font-weight:600;">${inv.outcome}</span></p>
                    <p style="margin:2px 0;"><strong>Started:</strong> ${inv.startDate}</p>
                    ${inv.closeDate ? `<p style="margin:2px 0;"><strong>Closed:</strong> ${inv.closeDate}</p>` : ''}
                    ${inv.notes ? `<p style="margin:6px 0 0 0; font-size:0.85em; color:#555;"><strong>Notes:</strong> ${inv.notes}</p>` : ''}
                  </div>` : '';
                return `
                <div style="background: #e3f2fd; padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #2196F3;">
                  ${arrestedBanner}
                  <p><strong>Crime ID:</strong> ${crimeId}</p>
                  <p><strong>Type:</strong> ${crime.CRIME_TYPE || crime.crime_type}</p>
                  <p><strong>Date Occurred:</strong> ${crime.DATE_OCCURRED || crime.date_occurred}</p>
                  <p><strong>Status:</strong> <span style="color: ${
                    crimeStatus === 'Closed' ? 'green' : 
                    crimeStatus === 'Under Investigation' ? 'orange' : '#666'
                  };">${crimeStatus}</span></p>
                  <p><strong>Description:</strong> ${crime.CRIME_DESCRIPTION || crime.crime_description || 'N/A'}</p>
                  ${suspectsSection}
                  ${evidenceSection}
                  ${invSection}
                </div>`;
              }).join('')}
            </div>
          ` : `
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404;">⚠️ No crimes have been linked to this report yet. Officers will review and link relevant crimes soon.</p>
            </div>
          `}
        </div>
      `;
      
      Swal.fire({
        title: `Report #${reportId}`,
        html: detailsHtml,
        width: '700px',
        confirmButtonText: 'Close',
        confirmButtonColor: '#3085d6'
      });
    } catch (error) {
      console.error('❌ Error loading report details:', error);
      console.error('Error details:', error.response || error);
      Swal.fire('Error!', error.message || 'Failed to load report details', 'error');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('resolved') || statusLower.includes('closed')) return 'status-solved';
    if (statusLower.includes('investigation') || statusLower.includes('review')) return 'status-investigating';
    if (statusLower.includes('pending')) return 'status-pending';
    return 'status-unsolved';
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <div className="page-header" style={{ marginBottom: '30px' }}>
          <div>
            <h2 className="page-title">📋 My Crime Reports</h2>
            <p style={{ color: '#666', margin: '5px 0 0 0' }}>
              View and manage your submitted crime reports
            </p>
          </div>
          <button 
            onClick={() => setShowForm(true)} 
            className="btn btn-primary"
            style={{ 
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            + Report a Crime
          </button>
        </div>

        {/* Statistics Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
              {reports.length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Reports</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
              {reports.filter(r => (r.STATUS || r.status || '').toLowerCase().includes('pending')).length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Pending Review</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
              {reports.filter(r => (r.STATUS || r.status || '').toLowerCase().includes('investigation')).length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Under Investigation</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
              {reports.filter(r => (r.STATUS || r.status || '').toLowerCase().includes('resolved')).length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Resolved</div>
          </div>
        </div>

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div className="modal-header">
                <h3 className="modal-title">📝 Submit Crime Report</h3>
                <button onClick={() => setShowForm(false)} className="btn-close">×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '8px', borderLeft: '4px solid #2196F3' }}>
                  <p style={{ margin: 0, color: '#0d47a1', fontSize: '14px' }}>
                    ℹ️ <strong>Note:</strong> This report will be reviewed by our officers. You can provide details about the incident here.
                  </p>
                </div>
                
                <div className="form-group">
                  <label><b>Crime Type *</b></label>
                  <input
                    type="text"
                    value={formData.crimeType}
                    onChange={(e) => setFormData({ ...formData, crimeType: e.target.value })}
                    placeholder="e.g., Street Theft, Assault, Burglary"
                    required
                  />
                  <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                    Enter the type of crime that occurred
                  </small>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label><b>Date Occurred *</b></label>
                    <input
                      type="date"
                      value={formData.dateOccurred}
                      onChange={(e) => setFormData({ ...formData, dateOccurred: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />
                    <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                      When did the incident happen?
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <label><b>Time Occurred</b></label>
                    <input
                      type="time"
                      value={formData.timeOccurred}
                      onChange={(e) => setFormData({ ...formData, timeOccurred: e.target.value })}
                    />
                    <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                      Approximate time (optional)
                    </small>
                  </div>
                </div>
                
                <div className="form-group">
                  <label><b>Severity Level *</b></label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    required
                  >
                    <option value="Minor">Minor</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Major">Major</option>
                    <option value="Critical">Critical</option>
                  </select>
                  <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                    How serious was the incident?
                  </small>
                </div>
                
                <div className="form-group">
                  <label><b>Description *</b></label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the incident in detail... Include information such as:&#10;• What happened&#10;• Any witnesses&#10;• Any evidence you have"
                    required
                    rows="6"
                    style={{ fontFamily: 'inherit', fontSize: '14px' }}
                  />
                </div>
                
                <div style={{ marginTop: '20px', marginBottom: '10px' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px' }}>📍 Location Details</h4>
                </div>
                
                <div className="form-group">
                  <label><b>City *</b></label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g., Islamabad, Karachi, Lahore"
                    required
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label><b>Area</b></label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      placeholder="e.g., Blue Area, Saddar"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label><b>Street</b></label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      placeholder="e.g., Jinnah Avenue"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label><b>Your Name (Optional)</b></label>
                  <input
                    type="text"
                    value={formData.reportedByName}
                    onChange={(e) => setFormData({ ...formData, reportedByName: e.target.value })}
                    placeholder="Leave blank to use your registered name"
                  />
                  <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                    If you want to report anonymously or use a different name, you can specify it here.
                  </small>
                </div>
                
                <div className="form-actions">
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your reports...</p>
          </div>
        ) : (
          <div className="table-container">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Date Reported</th>
                    <th>Reported As</th>
                    <th>Report Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ color: '#999', fontSize: '18px' }}>
                          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📋</div>
                          <p style={{ margin: '0 0 10px 0', fontWeight: '500' }}>No reports found</p>
                          <p style={{ margin: 0, fontSize: '14px' }}>Click "Report a Crime" to submit your first report.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    reports.map((report) => (
                      <tr key={report.REPORT_ID || report.report_id}>
                        <td>
                          <strong>#{report.REPORT_ID || report.report_id}</strong>
                        </td>
                        <td>
                          {report.DATE_REPORTED || report.date_reported 
                            ? new Date(report.DATE_REPORTED || report.date_reported).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : 'N/A'}
                        </td>
                        <td>{report.REPORTED_BY || report.reported_by || report.VICTIM_NAME || report.victim_name || 'You'}</td>
                        <td>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: (report.REPORT_TYPE || report.report_type || '').includes('Registered') ? '#e3f2fd' : 
                                       (report.REPORT_TYPE || report.report_type || '').includes('Anonymous') ? '#fff3e0' : '#f5f5f5',
                            color: (report.REPORT_TYPE || report.report_type || '').includes('Registered') ? '#1976d2' : 
                                   (report.REPORT_TYPE || report.report_type || '').includes('Anonymous') ? '#f57c00' : '#666'
                          }}>
                            {report.REPORT_TYPE || report.report_type || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(report.STATUS || report.status)}`}>
                            {report.STATUS || report.status || 'Pending'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleViewDetails(report.REPORT_ID || report.report_id)}
                            className="btn btn-sm btn-info"
                            style={{ 
                              padding: '6px 16px',
                              fontSize: '13px',
                              borderRadius: '6px'
                            }}
                          >
                            📄 View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrimeReports;







