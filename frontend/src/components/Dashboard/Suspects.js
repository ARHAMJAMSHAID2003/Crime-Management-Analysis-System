import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { suspectsAPI, crimesAPI } from '../../services/api';
import './Crimes.css';

const Suspects = () => {
  const [suspects, setSuspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSuspect, setEditingSuspect] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: '',
    address: '',
    criminalRecord: false,
    status: '',
  });
  const [searchFilters, setSearchFilters] = useState({
    searchName: '',
    status: '',
    hasCriminalRecord: '',
  });
  const [expanded, setExpanded] = useState({});
  const [detailsCache, setDetailsCache] = useState({});

  useEffect(() => {
    loadSuspects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSuspects = async () => {
    try {
      setLoading(true);
      // Build query params from filters
      const params = new URLSearchParams();
      if (searchFilters.searchName) params.append('searchName', searchFilters.searchName);
      if (searchFilters.status) params.append('status', searchFilters.status);
      if (searchFilters.hasCriminalRecord !== '') params.append('hasCriminalRecord', searchFilters.hasCriminalRecord);
      
      const queryString = params.toString();
      const response = await suspectsAPI.getAll(queryString ? `?${queryString}` : '');
      setSuspects(response.data || response || []);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to load suspects',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setSearchFilters({
      searchName: '',
      status: '',
      hasCriminalRecord: '',
    });
  };

  const applyFilters = () => {
    loadSuspects();
  };

  const handleAdd = () => {
    setEditingSuspect(null);
    setFormData({
      name: '',
      gender: '',
      age: '',
      address: '',
      criminalRecord: false,
      status: '',
    });
    setShowForm(true);
  };

  const handleEdit = (suspect) => {
    setEditingSuspect(suspect);
    setFormData({
      name: suspect.NAME || suspect.Name || suspect.name || '',
      gender: suspect.GENDER || suspect.Gender || suspect.gender || '',
      age: suspect.AGE || suspect.Age || suspect.age || '',
      address: suspect.ADDRESS || suspect.Address || suspect.address || '',
      criminalRecord: (suspect.CRIMINAL_RECORD ?? suspect.Criminal_Record ?? suspect.criminal_record) === 1,
      status: suspect.STATUS || suspect.Status || suspect.status || '',
    });
    setShowForm(true);
  };

  const handleArrest = async (suspect) => {
    const suspectId = suspect.SUSPECT_ID || suspect.Suspect_ID || suspect.suspect_id;
    const suspectName = suspect.NAME || suspect.Name || suspect.name;
    const currentStatus = suspect.STATUS || suspect.Status || suspect.status;

    if (currentStatus === 'Arrested') {
      Swal.fire({ icon: 'info', title: 'Already Arrested', text: `${suspectName} is already marked as Arrested.`, confirmButtonColor: '#667eea' });
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: `🚨 Arrest Suspect — ${suspectName}`,
      html: `
        <div style="text-align:left;">
          <div style="background:#fff3cd; padding:10px; border-radius:8px; margin-bottom:14px; font-size:13px; border-left:4px solid #ffc107;">
            ⚠️ This will mark <strong>${suspectName}</strong> as <strong>Arrested</strong> and automatically notify all linked victims via email.
          </div>
          <div style="margin-bottom:10px;">
            <label style="display:block; font-weight:600; font-size:13px; margin-bottom:4px;">Arrest Date *</label>
            <input id="arrestDate" type="date" class="swal2-input" style="margin:0; width:92%;" value="${new Date().toISOString().split('T')[0]}" />
          </div>
          <div style="margin-bottom:10px;">
            <label style="display:block; font-weight:600; font-size:13px; margin-bottom:4px;">Arrest Location *</label>
            <input id="arrestLocation" type="text" class="swal2-input" style="margin:0; width:92%;" placeholder="e.g. University Road checkpoint" />
          </div>
          <div style="margin-bottom:10px;">
            <label style="display:block; font-weight:600; font-size:13px; margin-bottom:4px;">Case Number <span style="font-weight:400; color:#888;">(optional — for email subject)</span></label>
            <input id="arrestCaseNumber" type="text" class="swal2-input" style="margin:0; width:92%;" placeholder="e.g. CASE-2026-0015 (leave blank if unknown)" />
          </div>
          <div style="margin-bottom:6px;">
            <label style="display:block; font-weight:600; font-size:13px; margin-bottom:4px;">Additional Notes</label>
            <textarea id="arrestNotes" class="swal2-textarea" style="margin:0; width:92%; height:70px;" placeholder="Evidence secured, vehicle seized, etc."></textarea>
          </div>
        </div>
      `,
      width: '560px',
      showCancelButton: true,
      confirmButtonText: '🚨 Confirm Arrest & Notify Victims',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      preConfirm: () => {
        const date = document.getElementById('arrestDate').value;
        const location = document.getElementById('arrestLocation').value.trim();
        if (!date) { Swal.showValidationMessage('Arrest date is required'); return false; }
        if (!location) { Swal.showValidationMessage('Arrest location is required'); return false; }
        return {
          arrestDate: date,
          arrestLocation: location,
          caseNumber: document.getElementById('arrestCaseNumber').value.trim(),
          notes: document.getElementById('arrestNotes').value.trim(),
        };
      },
    });

    if (!formValues) return;

    try {
      Swal.fire({ title: 'Processing...', text: 'Updating status and sending notifications...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const response = await suspectsAPI.arrest(suspectId, formValues);
      const data = response.data || response;
      const notified = data.notifiedVictims || [];

      const victimRows = notified.length > 0
        ? notified.map(v => `
            <tr style="border-bottom:1px solid #e9ecef;">
              <td style="padding:8px 10px;">${v.name || 'N/A'}</td>
              <td style="padding:8px 10px;">${v.email || 'No email'}</td>
              <td style="padding:8px 10px;">
                ${v.status === 'sent'
                  ? '<span style="color:#28a745; font-weight:600;">✅ Sent</span>'
                  : v.status === 'failed'
                  ? '<span style="color:#dc3545;">❌ Failed</span>'
                  : '<span style="color:#856404;">⚠️ No config</span>'}
              </td>
            </tr>`).join('')
        : `<tr><td colspan="3" style="padding:12px; text-align:center; color:#888;">No victims with email addresses linked to this suspect's crimes.</td></tr>`;

      await Swal.fire({
        title: '🚨 Suspect Arrested — Notifications Sent',
        html: `
          <div style="text-align:left; max-height:480px; overflow-y:auto;">
            <div style="background:#d4edda; padding:12px 14px; border-radius:8px; margin-bottom:14px; border-left:4px solid #28a745;">
              ✅ <strong>${suspectName}</strong> has been marked as <strong>Arrested</strong>.
              ${formValues.arrestDate ? `<br>📅 ${formValues.arrestDate}` : ''}
              ${formValues.arrestLocation ? ` &nbsp;|&nbsp; 📍 ${formValues.arrestLocation}` : ''}
            </div>

            <h4 style="font-size:14px; margin:0 0 8px 0; color:#333;">🕵️ Suspect Status Update</h4>
            <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:16px;">
              <thead>
                <tr style="background:#325a77; color:white;">
                  <th style="padding:8px 10px; text-align:left;">Suspect</th>
                  <th style="padding:8px 10px; text-align:left;">Previous</th>
                  <th style="padding:8px 10px; text-align:left;">Updated To</th>
                </tr>
              </thead>
              <tbody>
                <tr style="background:#e8f5e9;">
                  <td style="padding:8px 10px;"><strong>${suspectName}</strong> (#${suspectId})</td>
                  <td style="padding:8px 10px;"><span style="background:#fff3cd; padding:2px 8px; border-radius:4px;">${currentStatus || 'At Large'}</span></td>
                  <td style="padding:8px 10px;"><span style="background:#d4edda; padding:2px 8px; border-radius:4px; color:#155724; font-weight:600;">Arrested</span></td>
                </tr>
              </tbody>
            </table>

            <h4 style="font-size:14px; margin:0 0 8px 0; color:#333;">🔔 Victim Notifications</h4>
            <table style="width:100%; border-collapse:collapse; font-size:13px;">
              <thead>
                <tr style="background:#325a77; color:white;">
                  <th style="padding:8px 10px; text-align:left;">Victim</th>
                  <th style="padding:8px 10px; text-align:left;">Email</th>
                  <th style="padding:8px 10px; text-align:left;">Status</th>
                </tr>
              </thead>
              <tbody>${victimRows}</tbody>
            </table>
            ${notified.some(v => v.status === 'no_email_config')
              ? '<div style="background:#fff3cd; padding:8px 12px; border-radius:6px; font-size:12px; color:#856404; margin-top:8px;">ℹ️ Email not configured (EMAIL_USER/EMAIL_PASS missing in backend .env). Add credentials to enable real emails.</div>'
              : ''}
          </div>
        `,
        width: '620px',
        confirmButtonText: 'Done',
        confirmButtonColor: '#28a745',
      });

      loadSuspects();
    } catch (error) {
      Swal.fire('Error!', error.message || 'Failed to process arrest', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await suspectsAPI.delete(id);
        Swal.fire('Deleted!', 'Suspect has been deleted.', 'success');
        loadSuspects();
      } catch (error) {
        Swal.fire('Error!', error.message || 'Failed to delete suspect', 'error');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        gender: formData.gender || null,
        age: formData.age ? parseInt(formData.age) : null,
        address: formData.address || null,
        criminalRecord: !!formData.criminalRecord,
        status: formData.status || null,
      };
      if (editingSuspect) {
        const suspectId = editingSuspect.SUSPECT_ID || editingSuspect.Suspect_ID || editingSuspect.suspect_id;
        await suspectsAPI.update(suspectId, payload);
        Swal.fire('Success!', 'Suspect updated.', 'success');
        setShowForm(false);
        setEditingSuspect(null);
        loadSuspects();
      } else {
        // Create suspect
        await suspectsAPI.create(payload);
        setShowForm(false);

        // Get the newly created suspect's ID by searching by name
        const freshResponse = await suspectsAPI.getAll('');
        const allSuspects = freshResponse.data || freshResponse || [];
        const sorted = [...allSuspects].sort((a, b) => (b.SUSPECT_ID || 0) - (a.SUSPECT_ID || 0));
        const newSuspect = sorted[0];
        const newSuspectId = newSuspect?.SUSPECT_ID || newSuspect?.Suspect_ID || newSuspect?.suspect_id;

        // WF2 S6 — Link Suspect to Crime (wireframe step)
        // Fetch crimes for dropdown
        let crimeOptions = '<option value="">— Select a Crime —</option>';
        try {
          const crimesResp = await crimesAPI.getAll('');
          const allCrimes = crimesResp.data || crimesResp || [];
          if (allCrimes.length === 0) {
            crimeOptions += '<option value="" disabled>No crimes found in database</option>';
          } else {
            allCrimes.forEach(c => {
              const id = c.CRIME_ID || c.Crime_ID || c.crime_id;
              const typeName = c.TYPE_NAME || c.Crime_Type || 'Unknown Type';
              const city = c.CITY || c.City || '';
              const area = c.AREA || c.Area || '';
              const status = c.STATUS || c.Status || '';
              const label = `#${id} — ${typeName}${city ? ' · ' + city : ''}${area ? ' (' + area + ')' : ''} [${status}]`;
              crimeOptions += `<option value="${id}">${label}</option>`;
            });
          }
        } catch (e) {
          crimeOptions += '<option value="" disabled>Failed to load crimes</option>';
        }

        const { value: linkValues, isConfirmed: doLink } = await Swal.fire({
          title: '🔗 Link Suspect to Crime?',
          html: `
            <div style="text-align:left;">
              <div style="background:#d4edda; padding:12px; border-radius:8px; margin-bottom:15px; border-left:4px solid #28a745; font-size:13px;">
                ✅ Suspect <strong>${payload.name}</strong>${newSuspectId ? ` (ID: #${newSuspectId})` : ''} saved successfully.
              </div>
              <p style="color:#555; font-size:13px; margin-bottom:15px;">Would you like to link this suspect to a crime? You can skip and do it later.</p>
              <div style="margin-bottom:12px;">
                <label style="display:block; font-weight:600; margin-bottom:5px; font-size:13px;">Select Crime *</label>
                <select id="linkCrimeId" class="swal2-input" style="margin:0; width:92%; font-size:13px;">
                  ${crimeOptions}
                </select>
              </div>
              <div style="margin-bottom:12px;">
                <label style="display:block; font-weight:600; margin-bottom:5px; font-size:13px;">Suspect Role *</label>
                <select id="linkRole" class="swal2-input" style="margin:0; width:92%; font-size:13px;">
                  <option value="Primary Suspect">Primary Suspect</option>
                  <option value="Accomplice">Accomplice</option>
                  <option value="Person of Interest">Person of Interest</option>
                </select>
              </div>
              <div style="margin-bottom:12px;">
                <label style="display:block; font-weight:600; margin-bottom:5px; font-size:13px;">Arrest Status</label>
                <select id="linkArrestStatus" class="swal2-input" style="margin:0; width:92%; font-size:13px;">
                  <option value="Pending">Pending</option>
                  <option value="Arrested">Arrested</option>
                  <option value="Released">Released</option>
                  <option value="Cleared">Cleared</option>
                </select>
              </div>
            </div>
          `,
          width: '560px',
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: '🔗 Link to Crime',
          denyButtonText: 'Skip for Now',
          confirmButtonColor: '#667eea',
          denyButtonColor: '#6c757d',
          focusConfirm: false,
          preConfirm: () => {
            const crimeId = document.getElementById('linkCrimeId').value;
            if (!crimeId) { Swal.showValidationMessage('Please select a crime'); return false; }
            return {
              crimeId: parseInt(crimeId),
              role: document.getElementById('linkRole').value,
              arrestStatus: document.getElementById('linkArrestStatus').value,
            };
          }
        });

        if (doLink && linkValues && newSuspectId) {
          try {
            await crimesAPI.linkSuspect(linkValues.crimeId, newSuspectId, linkValues.role, linkValues.arrestStatus);
            Swal.fire({
              icon: 'success',
              title: '✅ Suspect Linked!',
              html: `<strong>${payload.name}</strong> linked to Crime <strong>#${linkValues.crimeId}</strong> as <strong>${linkValues.role}</strong>.`,
              confirmButtonColor: '#667eea'
            });
          } catch (linkErr) {
            Swal.fire('Warning', `Suspect saved but could not link to crime: ${linkErr.message}`, 'warning');
          }
        } else if (!doLink) {
          Swal.fire({ icon: 'success', title: 'Suspect Created!', text: `${payload.name} added. Link to a crime from the table when ready.`, confirmButtonColor: '#667eea' });
        }

        loadSuspects();
      }
    } catch (error) {
      Swal.fire('Error!', error.message || 'Failed to save suspect', 'error');
    }
  };

  // Sort suspects by ID (backend already filtered)
  const sortedSuspects = [...suspects].sort((a, b) => {
    const aId = a.SUSPECT_ID || a.Suspect_ID || a.suspect_id || 0;
    const bId = b.SUSPECT_ID || b.Suspect_ID || b.suspect_id || 0;
    return aId - bId;
  });

  const toggleDetails = async (suspect) => {
    const suspectId = suspect.SUSPECT_ID || suspect.Suspect_ID || suspect.suspect_id;
    const isOpen = expanded[suspectId];
    if (isOpen) {
      setExpanded((prev) => ({ ...prev, [suspectId]: false }));
      return;
    }
    if (!detailsCache[suspectId]) {
      try {
        const resp = await suspectsAPI.getById(suspectId);
        const data = resp.data || resp || {};
        setDetailsCache((prev) => ({ ...prev, [suspectId]: data }));
      } catch (err) {
        Swal.fire('Error!', err.message || 'Failed to load suspect details', 'error');
        return;
      }
    }
    setExpanded((prev) => ({ ...prev, [suspectId]: true }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading suspects...</p>
      </div>
    );
  }

  return (
    <div className="crimes-container">
      <div className="page-header">
        <h2 className="page-title">👤 Suspects Management</h2>
        <button onClick={handleAdd} className="btn btn-primary">
          + Add New Suspect
        </button>
      </div>

      {/* Search and Filter Section */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>🔍 Search & Filter</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={applyFilters} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '5px 15px' }}>
              Apply Filters
            </button>
            <button onClick={clearFilters} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '5px 15px' }}>
              Clear Filters
            </button>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>Search by Name</label>
            <input
              type="text"
              name="searchName"
              value={searchFilters.searchName}
              onChange={handleFilterChange}
              placeholder="Enter suspect name..."
              style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>Status</label>
            <select
              name="status"
              value={searchFilters.status}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            >
              <option value="">All Statuses</option>
              <option value="Unknown">Unknown</option>
              <option value="At Large">At Large</option>
              <option value="Arrested">Arrested</option>
              <option value="In Custody">In Custody</option>
              <option value="Released">Released</option>
              <option value="Cleared">Cleared</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>Criminal Record</label>
            <select
              name="hasCriminalRecord"
              value={searchFilters.hasCriminalRecord}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Criminal Record</th>
                <th>Status</th>
                <th>Address</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSuspects.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: '#999' }}>No suspects found.</p>
                  </td>
                </tr>
              ) : (
                sortedSuspects.map((suspect) => {
                  const suspectId = suspect.SUSPECT_ID || suspect.Suspect_ID || suspect.suspect_id;
                  const name = suspect.NAME || suspect.Name || suspect.name;
                  const age = suspect.AGE || suspect.Age || suspect.age;
                  const gender = suspect.GENDER || suspect.Gender || suspect.gender;
                  const address = suspect.ADDRESS || suspect.Address || suspect.address;
                  const criminalRecord = suspect.CRIMINAL_RECORD ?? suspect.Criminal_Record ?? suspect.criminal_record;
                  const status = suspect.STATUS || suspect.Status || suspect.status;

                  const recordText = criminalRecord === 1 || criminalRecord === '1' ? 'Yes' :
                                    criminalRecord === 0 || criminalRecord === '0' ? 'No' :
                                    criminalRecord ?? 'N/A';
                  
                  return (
                    <React.Fragment key={suspectId}>
                      <tr>
                        <td>{suspectId}</td>
                        <td>{name || 'N/A'}</td>
                        <td>{age || 'N/A'}</td>
                        <td>{gender || 'N/A'}</td>
                        <td>{recordText}</td>
                        <td>{status || 'N/A'}</td>
                        <td>{address || 'N/A'}</td>
                        <td>
                          <button 
                            className="btn btn-outline-primary btn-sm" 
                            onClick={() => toggleDetails(suspect)}
                            title={expanded[suspectId] ? "Hide crime history" : "View crime history"}
                          >
                            {expanded[suspectId] ? '▲ Hide' : '▼ Details'}
                          </button>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleArrest(suspect)}
                              className="btn btn-danger btn-sm"
                              title="Mark suspect as arrested and notify victims"
                              disabled={status === 'Arrested'}
                              style={{ opacity: status === 'Arrested' ? 0.5 : 1, cursor: status === 'Arrested' ? 'not-allowed' : 'pointer' }}
                            >
                              🚨 Arrest
                            </button>
                            <button
                              onClick={() => handleEdit(suspect)}
                              className="btn btn-secondary btn-sm"
                              title="Edit suspect details"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(suspectId)}
                              className="btn btn-danger btn-sm"
                              title="Delete suspect"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expanded[suspectId] && (
                        <tr>
                          <td colSpan="9" style={{ background: '#f8f9fa', padding: 0 }}>
                            {detailsCache[suspectId] ? (
                              <div style={{ padding: '20px' }}>
                                <div style={{ 
                                  background: 'white', 
                                  borderRadius: '8px', 
                                  padding: '15px',
                                  border: '1px solid #dee2e6'
                                }}>
                                  <h4 style={{ 
                                    marginTop: 0, 
                                    marginBottom: '15px',
                                    color: '#495057',
                                    borderBottom: '2px solid #007bff',
                                    paddingBottom: '8px'
                                  }}>
                                    🔗 Crime History
                                  </h4>
                                  {detailsCache[suspectId].crimeHistory && detailsCache[suspectId].crimeHistory.length > 0 ? (
                                    <div style={{ overflowX: 'auto' }}>
                                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                          <tr style={{ background: '#f8f9fa' }}>
                                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Crime ID</th>
                                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Crime Type</th>
                                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Date Occurred</th>
                                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Role</th>
                                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Arrest Status</th>
                                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Description</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {detailsCache[suspectId].crimeHistory.map((c, idx) => {
                                            const crimeStatus = c.STATUS || c.Status || c.status || 'N/A';
                                            const arrestStatus = c.ARREST_STATUS || c.Arrest_Status || c.arrest_status || 'N/A';
                                            
                                            return (
                                              <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                                                <td style={{ padding: '10px' }}>
                                                  <span style={{ 
                                                    background: '#e3f2fd', 
                                                    padding: '4px 8px', 
                                                    borderRadius: '4px',
                                                    fontWeight: 'bold'
                                                  }}>
                                                    #{c.CRIME_ID || c.Crime_ID || c.crime_id || 'N/A'}
                                                  </span>
                                                </td>
                                                <td style={{ padding: '10px' }}>{c.CRIME_TYPE || c.Crime_Type || c.crime_type || 'N/A'}</td>
                                                <td style={{ padding: '10px' }}>
                                                  {c.DATE_OCCURRED || c.Date_Occurred || c.date_occurred 
                                                    ? new Date(c.DATE_OCCURRED || c.Date_Occurred || c.date_occurred).toLocaleDateString()
                                                    : 'N/A'}
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                  <span style={{ 
                                                    background: '#fff3cd', 
                                                    padding: '4px 8px', 
                                                    borderRadius: '4px',
                                                    fontSize: '0.85rem'
                                                  }}>
                                                    {c.ROLE || c.Role || c.role || 'N/A'}
                                                  </span>
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                  <span style={{ 
                                                    background: arrestStatus === 'Arrested' ? '#d4edda' : '#f8d7da',
                                                    color: arrestStatus === 'Arrested' ? '#155724' : '#721c24',
                                                    padding: '4px 8px', 
                                                    borderRadius: '4px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '500'
                                                  }}>
                                                    {arrestStatus}
                                                  </span>
                                                </td>
                                                <td style={{ padding: '10px' }}>
                                                  <span style={{ 
                                                    background: crimeStatus === 'Closed' ? '#d4edda' : crimeStatus === 'Open' ? '#f8d7da' : '#fff3cd',
                                                    color: crimeStatus === 'Closed' ? '#155724' : crimeStatus === 'Open' ? '#721c24' : '#856404',
                                                    padding: '4px 8px', 
                                                    borderRadius: '4px',
                                                    fontSize: '0.85rem'
                                                  }}>
                                                    {crimeStatus}
                                                  </span>
                                                </td>
                                                <td style={{ padding: '10px', maxWidth: '300px' }}>
                                                  {(c.DESCRIPTION || c.Description || c.description || 'N/A').substring(0, 100)}
                                                  {(c.DESCRIPTION || c.Description || c.description || '').length > 100 && '...'}
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <p style={{ margin: 0, padding: '20px', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '4px' }}>
                                      No linked crimes found for this suspect.
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div style={{ padding: '20px', textAlign: 'center' }}>
                                <div className="spinner" style={{ margin: '0 auto' }}></div>
                                <p style={{ marginTop: '10px', color: '#666' }}>Loading crime history...</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingSuspect ? 'Edit Suspect' : 'Add Suspect'}</h3>
              <button onClick={() => setShowForm(false)} className="btn-close">×</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Criminal Record</label>
                  <select
                    value={formData.criminalRecord ? 'Yes' : 'No'}
                    onChange={(e) => setFormData({ ...formData, criminalRecord: e.target.value === 'Yes' })}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="At Large">At Large</option>
                    <option value="Released">Released</option>
                    <option value="Arrested">Arrested</option>
                    <option value="Unknown">Unknown</option>
                    <option value="In Custody">In Custody</option>
                    <option value="Cleared">Cleared</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSuspect ? 'Update Suspect' : 'Create Suspect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suspects;

