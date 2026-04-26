import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { crimeReportsAPI, crimesAPI, crimeTypesAPI, locationsAPI, investigationsAPI, officersAPI } from '../../services/api';
import './Crimes.css';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    victimId: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.victimId) params.victimId = filters.victimId;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;

      const response = await crimeReportsAPI.getAll(params);
      console.log('📋 Reports loaded:', response.data);
      setReports(response.data || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
      Swal.fire('Error!', error.message || 'Failed to load reports', 'error');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    loadReports();
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      victimId: '',
      dateFrom: '',
      dateTo: ''
    });
    setTimeout(() => loadReports(), 100);
  };

  const handleViewDetails = async (reportId) => {
    try {
      const response = await crimeReportsAPI.getById(reportId);
      const reportData = response.data;
      const currentStatus = reportData.report.STATUS || reportData.report.status;
      const isPending = currentStatus === 'Pending Review';
      
      let detailsHtml = `
        <div style="text-align: left; max-height: 520px; overflow-y: auto;">
          <!-- Report Info -->
          <div style="margin-bottom: 18px; background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
            <h4 style="color: #333; margin: 0 0 10px 0; font-size: 15px;">📋 Report Information</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
              <div><span style="color:#888;">Report ID:</span> <strong>#${reportData.report.REPORT_ID || reportData.report.report_id}</strong></div>
              <div><span style="color:#888;">Date Reported:</span> <strong>${new Date(reportData.report.DATE_REPORTED || reportData.report.date_reported).toLocaleString()}</strong></div>
              <div><span style="color:#888;">Status:</span> <strong style="color:${
                currentStatus === 'Resolved' ? '#2e7d32' : 
                currentStatus === 'Under Investigation' ? '#1976d2' : 
                currentStatus === 'Rejected' ? '#d32f2f' :
                currentStatus === 'Pending Review' ? '#f57c00' : '#666'
              };">${currentStatus}</strong></div>
              <div><span style="color:#888;">Report Type:</span> <strong>${reportData.report.REPORT_TYPE || reportData.report.report_type || 'N/A'}</strong></div>
              <div><span style="color:#888;">Reported By:</span> <strong>${reportData.report.REPORTED_BY || reportData.report.reported_by || reportData.report.VICTIM_NAME || reportData.report.victim_name || 'N/A'}</strong></div>
              ${(reportData.report.VICTIM_EMAIL || reportData.report.victim_email) ? `<div><span style="color:#888;">Contact:</span> <strong>${reportData.report.VICTIM_EMAIL || reportData.report.victim_email}</strong></div>` : ''}
            </div>
          </div>
          
          <!-- Report Details -->
          <div style="margin-bottom: 18px;">
            <h4 style="color: #333; margin: 0 0 8px 0; font-size: 15px;">📝 Report Details</h4>
            <div style="background: #f9f9f9; padding: 13px; border-radius: 8px; white-space: pre-wrap; max-height: 180px; overflow-y: auto; font-size: 13px; line-height: 1.5;">
              ${reportData.report.DETAILS || reportData.report.details || 'No details provided'}
            </div>
          </div>
          
          <!-- Linked Crimes -->
          ${reportData.linked_crimes && reportData.linked_crimes.length > 0 ? `
            <div style="margin-bottom: 18px;">
              <h4 style="color: #333; margin: 0 0 8px 0; font-size: 15px;">🔗 Linked Crimes (${reportData.total_linked_crimes})</h4>
              ${reportData.linked_crimes.map(crime => `
                <div style="background: #e8f5e9; padding: 10px; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid #4caf50; font-size: 13px;">
                  <strong>Crime #${crime.CRIME_ID || crime.crime_id}</strong> — ${crime.CRIME_TYPE || crime.crime_type} 
                  <span style="color:#666;"> | ${crime.DATE_OCCURRED || crime.date_occurred} | ${crime.CRIME_STATUS || crime.crime_status}</span>
                  ${(crime.LINK_NOTES || crime.link_notes) ? `<div style="margin-top:4px; color:#555;"><em>Notes: ${crime.LINK_NOTES || crime.link_notes}</em></div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : `
            <div style="background: #fff3cd; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107; font-size: 13px; color: #856404; margin-bottom: 18px;">
              ⚠️ No crimes linked yet. Accept this report to automatically create and link a crime record.
            </div>
          `}
          
          ${isPending ? `
          <!-- Officer Decision Banner -->
          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 1px solid #dee2e6; border-radius: 10px; padding: 15px; text-align: center;">
            <h4 style="color: #333; margin: 0 0 8px 0; font-size: 15px;">⚖️ Officer Decision Required</h4>
            <p style="color: #666; font-size: 12px; margin: 0 0 12px 0;">Review the report above and choose to accept or reject it.</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
              <div style="background: #dc3545; color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 13px;">✗ Reject</div>
              <div style="background: #28a745; color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 13px;">✓ Accept &amp; Create Investigation</div>
            </div>
            <p style="color: #888; font-size: 11px; margin: 10px 0 0 0;">Use the Accept / Reject buttons in the table row, or click "Accept Report" / "Reject Report" below.</p>
          </div>
          ` : ''}
        </div>
      `;
      
      const swalConfig = {
        title: `📋 Crime Report #${reportId}`,
        html: detailsHtml,
        width: '780px',
        confirmButtonColor: '#667eea',
      };

      if (isPending) {
        swalConfig.showDenyButton = true;
        swalConfig.showCancelButton = true;
        swalConfig.confirmButtonText = '✅ Accept Report';
        swalConfig.denyButtonText = '❌ Reject Report';
        swalConfig.cancelButtonText = 'Close';
        swalConfig.denyButtonColor = '#dc3545';
      } else {
        swalConfig.showCancelButton = true;
        swalConfig.confirmButtonText = 'Update Status';
        swalConfig.cancelButtonText = 'Close';
      }

      const result = await Swal.fire(swalConfig);

      if (result.isConfirmed) {
        if (isPending) {
          handleAcceptReport(reportId);
        } else {
          handleUpdateStatus(reportId, currentStatus);
        }
      } else if (result.isDenied) {
        handleRejectReport(reportId);
      }
    } catch (error) {
      console.error('Error loading report details:', error);
      Swal.fire('Error!', 'Failed to load report details', 'error');
    }
  };

  const handleUpdateStatus = async (reportId, currentStatus) => {
    const { value: newStatus } = await Swal.fire({
      title: 'Update Report Status',
      input: 'select',
      inputOptions: {
        'Pending Review': 'Pending Review',
        'Under Investigation': 'Under Investigation',
        'Resolved': 'Resolved',
        'Closed': 'Closed',
        'Rejected': 'Rejected'
      },
      inputValue: currentStatus,
      showCancelButton: true,
      confirmButtonText: 'Update',
      confirmButtonColor: '#667eea',
      inputValidator: (value) => {
        if (!value) {
          return 'Please select a status!';
        }
      }
    });

    if (newStatus) {
      try {
        await crimeReportsAPI.updateStatus(reportId, newStatus);
        Swal.fire({
          icon: 'success',
          title: 'Status Updated!',
          text: `Report #${reportId} status changed to "${newStatus}"`,
          confirmButtonColor: '#667eea'
        });
        loadReports();
      } catch (error) {
        Swal.fire('Error!', error.message || 'Failed to update status', 'error');
      }
    }
  };

  const handleDeleteReport = async (reportId) => {
    const result = await Swal.fire({
      title: 'Delete Report?',
      text: 'Are you sure you want to delete this report? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#666',
      confirmButtonText: 'Yes, delete it'
    });

    if (result.isConfirmed) {
      try {
        await crimeReportsAPI.delete(reportId);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Report has been deleted.',
          confirmButtonColor: '#667eea'
        });
        loadReports();
      } catch (error) {
        Swal.fire('Error!', error.message || 'Failed to delete report', 'error');
      }
    }
  };

  const handleAcceptReport = async (reportId) => {
    try {
      // Step 1: Get officers list and report data
      const [reportResponse, officersResponse] = await Promise.all([
        crimeReportsAPI.getById(reportId),
        officersAPI.getAll()
      ]);
      const reportData = reportResponse.data;
      const officers = officersResponse.data || [];

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const officerId = user.id || user.userId;

      if (!officerId) {
        Swal.fire('Error!', 'User session invalid. Please login again.', 'error');
        return;
      }

      const reportDetails = reportData.report.DETAILS || reportData.report.details || '';

      // Parse report details
      const parseReportDetails = (details) => {
        const lines = details.split('\n');
        const parsed = { crimeType: '', date: '', time: '', city: '', area: '', street: '', severity: 'Moderate', description: '' };
        let inDescription = false, descriptionText = '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('Crime Type:')) parsed.crimeType = trimmed.replace('Crime Type:', '').trim();
          else if (trimmed.startsWith('Date:')) { const parts = trimmed.replace('Date:', '').trim().split(' '); parsed.date = parts[0]; if (parts[1]) parsed.time = parts[1]; }
          else if (trimmed.startsWith('Location:')) { const loc = trimmed.replace('Location:', '').trim().split(',').map(p => p.trim()); parsed.city = loc[0] || ''; parsed.area = loc[1] || ''; parsed.street = loc[2] || ''; }
          else if (trimmed.startsWith('Severity:')) parsed.severity = trimmed.replace('Severity:', '').trim();
          else if (trimmed === 'Description:') inDescription = true;
          else if (inDescription && trimmed) descriptionText += (descriptionText ? '\n' : '') + trimmed;
        }
        parsed.description = descriptionText || details;
        return parsed;
      };

      const parsedData = parseReportDetails(reportDetails);

      if (!parsedData.crimeType || !parsedData.city) {
        Swal.fire('Error!', 'Report is missing Crime Type or City. Cannot create crime.', 'error');
        return;
      }

      // Step 2: Show "Create Investigation" form (S9 wireframe)
      const year = new Date().getFullYear();
      const autoCaseNumber = `CASE-${year}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;
      const today = new Date().toISOString().split('T')[0];

      const { value: formValues, isConfirmed } = await Swal.fire({
        title: '📋 Create Investigation — Report #' + reportId,
        html: `
          <div style="text-align:left; max-height:520px; overflow-y:auto; padding:5px 0;">
            <div style="background:#e3f2fd; padding:12px; border-radius:8px; margin-bottom:16px; font-size:13px; border-left:4px solid #1976d2;">
              <strong>✅ Crime record will be auto-created from this report.</strong><br>
              <span style="color:#555;">Crime Type: <strong>${parsedData.crimeType}</strong> | Location: <strong>${parsedData.city}${parsedData.area ? ', ' + parsedData.area : ''}</strong> | Severity: <strong>${parsedData.severity}</strong></span>
            </div>

            <div style="margin-bottom:14px;">
              <label style="display:block; font-weight:600; margin-bottom:5px; font-size:13px;">Auto Case Number</label>
              <input id="caseNumber" class="swal2-input" value="${autoCaseNumber}" style="margin:0; width:90%; font-size:13px; background:#f8f9fa;">
            </div>

            <div style="margin-bottom:14px;">
              <label style="display:block; font-weight:600; margin-bottom:5px; font-size:13px;">Lead Officer *</label>
              <select id="leadOfficerId" class="swal2-input" style="margin:0; width:92%; font-size:13px;">
                <option value="${officerId}">Current Officer (You)</option>
                ${officers.map(o => `<option value="${o.OFFICER_ID}" ${o.OFFICER_ID == officerId ? 'selected' : ''}>${o.NAME} (#${o.OFFICER_ID})</option>`).join('')}
              </select>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px;">
              <div>
                <label style="display:block; font-weight:600; margin-bottom:5px; font-size:13px;">Priority Level *</label>
                <select id="priority" class="swal2-input" style="margin:0; width:90%; font-size:13px;">
                  <option value="High" ${parsedData.severity === 'Severe' || parsedData.severity === 'Major' ? 'selected' : ''}>High</option>
                  <option value="Medium" ${parsedData.severity === 'Moderate' ? 'selected' : ''}>Medium</option>
                  <option value="Low" ${parsedData.severity === 'Minor' ? 'selected' : ''}>Low</option>
                </select>
              </div>
              <div>
                <label style="display:block; font-weight:600; margin-bottom:5px; font-size:13px;">Expected Completion</label>
                <input id="expectedCompletion" type="date" class="swal2-input" style="margin:0; width:90%; font-size:13px;" min="${today}">
              </div>
            </div>

            <div style="margin-bottom:14px;">
              <label style="display:block; font-weight:600; margin-bottom:5px; font-size:13px;">Initial Investigation Notes *</label>
              <textarea id="invNotes" class="swal2-textarea" style="width:90%; margin:0; min-height:100px; font-size:13px;" 
                placeholder="e.g. Report accepted. Priority actions: 1. Collect evidence 2. Canvas witnesses 3. Cross-reference similar incidents"></textarea>
            </div>

            <div style="background:#fff3cd; padding:10px; border-radius:6px; font-size:12px; color:#856404; border-left:3px solid #ffc107;">
              ℹ️ Upon creation: Report → "Under Investigation" | Crime record created | Investigation opened | Crime linked to investigation
            </div>
          </div>
        `,
        width: '680px',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: '🔍 Create Investigation',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        preConfirm: () => {
          const caseNumber = document.getElementById('caseNumber').value.trim();
          const leadOfficerId = document.getElementById('leadOfficerId').value;
          const priority = document.getElementById('priority').value;
          const expectedCompletion = document.getElementById('expectedCompletion').value;
          const invNotes = document.getElementById('invNotes').value.trim();
          if (!caseNumber) { Swal.showValidationMessage('Case number is required'); return false; }
          if (!invNotes) { Swal.showValidationMessage('Initial investigation notes are required'); return false; }
          return { caseNumber, leadOfficerId: leadOfficerId || officerId, priority, expectedCompletion, invNotes };
        }
      });

      if (!isConfirmed || !formValues) return;

      // Step 3: Create crime
      const crimeData = {
        crimeTypeName: parsedData.crimeType,
        city: parsedData.city,
        area: parsedData.area || '',
        street: parsedData.street || '',
        dateOccurred: parsedData.date || today,
        dateReported: today,
        timeOccurred: parsedData.time || '',
        severityLevel: parsedData.severity || 'Moderate',
        description: parsedData.description,
        status: 'Open',
        officerId
      };
      const crimeResult = await crimesAPI.create(crimeData);
      const newCrimeId = crimeResult.crimeId || crimeResult.data?.crimeId;
      if (!newCrimeId) throw new Error('Crime was created but no crimeId was returned');

      // Step 4: Link report to crime & update report status
      await crimeReportsAPI.linkToCrime(reportId, newCrimeId, `Auto-linked when accepting report #${reportId}`);
      await crimeReportsAPI.updateStatus(reportId, 'Under Investigation');

      // Step 4.5: Link the victim to the crime in Crime_Victim table (so arrest notifications work)
      const victimId = reportData.report.VICTIM_ID || reportData.report.victim_id;
      if (victimId) {
        try {
          await crimesAPI.linkVictim(newCrimeId, victimId, 'Unknown');
        } catch (linkVictimErr) {
          console.warn('Could not link victim to crime:', linkVictimErr.message);
        }
      }

      // Step 5: Create investigation
      const invData = {
        caseNumber: formValues.caseNumber,
        leadOfficerId: formValues.leadOfficerId || officerId,
        startDate: today,
        status: 'Active',
        notes: `Priority: ${formValues.priority}\n${formValues.expectedCompletion ? 'Expected Completion: ' + formValues.expectedCompletion + '\n' : ''}${formValues.invNotes}`
      };
      const invResult = await investigationsAPI.create(invData);
      const newInvId = invResult.investigationId || invResult.data?.investigationId;

      // Step 6: Link crime to investigation
      if (newInvId) {
        try {
          await investigationsAPI.linkCrime(newInvId, newCrimeId);
        } catch (linkErr) {
          console.warn('Could not link crime to investigation:', linkErr.message);
        }
      }

      Swal.fire({
        icon: 'success',
        title: '✅ Investigation Created!',
        html: `
          <div style="text-align:left; padding:5px;">
            <p style="margin-bottom:8px;">Report <strong>#${reportId}</strong> accepted and processed:</p>
            <ul style="margin:0; padding-left:20px; font-size:14px; line-height:1.8;">
              <li>Crime <strong>#${newCrimeId}</strong> created (${parsedData.crimeType})</li>
              <li>Investigation <strong>${formValues.caseNumber}</strong> opened${newInvId ? ` (#${newInvId})` : ''}</li>
              <li>Crime linked to investigation</li>
              <li>Report status → <strong>Under Investigation</strong></li>
            </ul>
            <p style="margin-top:12px; font-size:13px; color:#666;">Navigate to the <strong>Investigations</strong> tab to manage the case.</p>
          </div>
        `,
        confirmButtonColor: '#28a745'
      });
      loadReports();
    } catch (error) {
      console.error('Error accepting report:', error);
      Swal.fire('Error!', error.message || 'Failed to accept report', 'error');
    }
  };

  const handleRejectReport = async (reportId) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: '❌ Reject Report',
      html: `
        <div style="text-align: left; margin-bottom: 10px;">
          <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
            You are about to reject <strong>Report #${reportId}</strong>. Please provide a reason.
          </p>
        </div>
      `,
      input: 'textarea',
      inputLabel: 'Rejection Reason',
      inputPlaceholder: 'Enter the reason for rejection (e.g. duplicate report, insufficient information, false report)...',
      inputAttributes: {
        style: 'min-height: 100px; font-size: 14px;'
      },
      showCancelButton: true,
      confirmButtonText: '❌ Reject Report',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      width: '550px',
      inputValidator: (value) => {
        if (!value || value.trim().length < 10) {
          return 'Please provide a rejection reason (at least 10 characters)';
        }
      }
    });

    if (isConfirmed && reason) {
      try {
        await crimeReportsAPI.updateStatus(reportId, 'Rejected');
        Swal.fire({
          icon: 'success',
          title: 'Report Rejected',
          html: `Report <strong>#${reportId}</strong> has been marked as <strong>Rejected</strong>.<br><small style="color:#666;">Reason: ${reason.trim()}</small>`,
          confirmButtonColor: '#667eea'
        });
        loadReports();
      } catch (error) {
        Swal.fire('Error!', error.message || 'Failed to reject report', 'error');
      }
    }
  };

  const handleAddReport = async () => {
    try {
      const crimeTypesResponse = await crimeTypesAPI.getAll();
      const locationsResponse = await locationsAPI.getAll();
      const crimeTypes = crimeTypesResponse.data || [];
      const locations = locationsResponse.data || [];

      const { value: formValues } = await Swal.fire({
        title: 'Add New Report',
        html: `
          <div style="text-align: left; max-height: 500px; overflow-y: auto; padding: 10px;">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;"><b>Crime Type *</b></label>
              <input id="swal-crimetype" type="text" class="swal2-input" style="margin: 0; width: 100%; padding: 10px;" placeholder="e.g., Street Theft, Assault">
              <small style="color: #666; font-size: 12px;">Enter the crime type name (e.g., "Street Theft", "Assault")</small>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;"><b>Date Occurred *</b></label>
                <input id="swal-dateoccurred" type="date" class="swal2-input" style="margin: 0; width: 100%; padding: 10px;" max="${new Date().toISOString().split('T')[0]}">
                <small style="color: #666; font-size: 11px;">Cannot be a future date</small>
              </div>
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;"><b>Date Reported</b></label>
                <input id="swal-datereported" type="date" class="swal2-input" style="margin: 0; width: 100%; padding: 10px;" value="${new Date().toISOString().split('T')[0]}" max="${new Date().toISOString().split('T')[0]}">
                <small style="color: #666; font-size: 11px;">Defaults to today</small>
              </div>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;"><b>Time Occurred</b></label>
              <input id="swal-timeoccurred" type="time" class="swal2-input" style="margin: 0; width: 100%; padding: 10px;">
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;"><b>Status</b></label>
                <select id="swal-status" class="swal2-select" style="margin: 0; width: 100%; padding: 10px;">
                  <option value="Open">Open</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;"><b>Severity Level</b></label>
              <select id="swal-severity" class="swal2-select" style="margin: 0; width: 100%; padding: 10px;">
                <option value="Minor">Minor</option>
                <option value="Moderate" selected>Moderate</option>
                <option value="Major">Major</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;"><b>Description *</b></label>
              <textarea id="swal-description" class="swal2-textarea" style="margin: 0; min-height: 80px; width: 100%;" placeholder="Describe the crime incident..."></textarea>
            </div>
            
            <h4 style="margin: 20px 0 10px 0; color: #333; font-size: 16px;">Location Details</h4>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;"><b>City *</b></label>
              <input id="swal-city" type="text" class="swal2-input" style="margin: 0; width: 100%; padding: 10px;" placeholder="e.g., Islamabad">
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;"><b>Area</b></label>
                <input id="swal-area" type="text" class="swal2-input" style="margin: 0; width: 100%; padding: 10px;" placeholder="e.g., Blue Area">
              </div>
              <div>
                <label style="display: block; margin-bottom: 5px; font-weight: 600;"><b>Street</b></label>
                <input id="swal-street" type="text" class="swal2-input" style="margin: 0; width: 100%; padding: 10px;" placeholder="e.g., Jinnah Avenue">
              </div>
            </div>
          </div>
        `,
        width: '700px',
        showCancelButton: true,
        confirmButtonText: '✅ Create Report',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#667eea',
        customClass: {
          container: 'swal-wide'
        },
        preConfirm: () => {
          const crimeType = document.getElementById('swal-crimetype').value;
          const dateOccurred = document.getElementById('swal-dateoccurred').value;
          const dateReported = document.getElementById('swal-datereported').value;
          const timeOccurred = document.getElementById('swal-timeoccurred').value;
          const status = document.getElementById('swal-status').value;
          const severity = document.getElementById('swal-severity').value;
          const description = document.getElementById('swal-description').value;
          const city = document.getElementById('swal-city').value;
          const area = document.getElementById('swal-area').value;
          const street = document.getElementById('swal-street').value;
          
          if (!crimeType || !dateOccurred || !description || !city) {
            Swal.showValidationMessage('Please fill in all required fields (Crime Type, Date Occurred, Description, City)');
            return false;
          }
          
          return {
            crimeType,
            dateOccurred,
            dateReported,
            timeOccurred,
            status,
            severity,
            description,
            city,
            area,
            street
          };
        }
      });

      if (formValues) {
        // Create the report only (not a crime)
        const reportData = {
          reportedByName: 'Officer Report',
          reportDetails: `Crime Type: ${formValues.crimeType}\nDate: ${formValues.dateOccurred}${formValues.timeOccurred ? ' ' + formValues.timeOccurred : ''}\nLocation: ${formValues.city}${formValues.area ? ', ' + formValues.area : ''}${formValues.street ? ', ' + formValues.street : ''}\nSeverity: ${formValues.severity}\nStatus: ${formValues.status}\n\nDescription:\n${formValues.description}`,
          reportStatus: 'Pending Review'
        };

        await crimeReportsAPI.create(reportData);
        
        Swal.fire({
          icon: 'success',
          title: 'Report Created!',
          text: 'Report has been submitted for review. It will appear in the reports list.',
          confirmButtonColor: '#667eea'
        });
        
        loadReports();
      }
    } catch (error) {
      console.error('Error creating report:', error);
      Swal.fire('Error!', error.message || 'Failed to create report', 'error');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('resolved') || statusLower.includes('closed')) return 'status-solved';
    if (statusLower.includes('investigation') || statusLower.includes('review')) return 'status-investigating';
    if (statusLower.includes('pending')) return 'status-pending';
    if (statusLower.includes('rejected')) return 'status-unsolved';
    return 'status-pending';
  };

  const getReportTypeStyle = (type) => {
    const typeLower = (type || '').toLowerCase();
    if (typeLower.includes('registered')) return { bg: '#e3f2fd', color: '#1976d2' };
    if (typeLower.includes('anonymous')) return { bg: '#fff3e0', color: '#f57c00' };
    return { bg: '#f5f5f5', color: '#666' };
  };

  return (
    <div className="crimes-container">
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <div>
          <h2 className="page-title">📋 Crime Reports Review</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>
            Review and manage crime reports submitted by victims and citizens
          </p>
        </div>
        <button onClick={handleAddReport} className="btn btn-primary">
          ➕ Add Report
        </button>
      </div>

      {/* Filter Section */}
      <div className="filter-section" style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '12px', 
        marginBottom: '25px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333' }}>🔍 Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              <option value="">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>Victim ID</label>
            <input
              type="number"
              value={filters.victimId}
              onChange={(e) => setFilters({ ...filters, victimId: e.target.value })}
              placeholder="Filter by victim ID"
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>
        </div>
        
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <button onClick={handleApplyFilters} className="btn btn-primary" style={{ padding: '8px 20px' }}>
            Apply Filters
          </button>
          <button onClick={handleClearFilters} className="btn btn-secondary" style={{ padding: '8px 20px' }}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '18px', borderRadius: '10px', color: 'white' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{reports.length}</div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>Total Reports</div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '18px', borderRadius: '10px', color: 'white' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
            {reports.filter(r => (r.STATUS || r.status || '').toLowerCase().includes('pending')).length}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>Pending Review</div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '18px', borderRadius: '10px', color: 'white' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
            {reports.filter(r => (r.STATUS || r.status || '').toLowerCase().includes('investigation')).length}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>Under Investigation</div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', padding: '18px', borderRadius: '10px', color: 'white' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
            {reports.filter(r => (r.STATUS || r.status || '').toLowerCase().includes('resolved')).length}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>Resolved</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Date Reported</th>
                  <th>Victim</th>
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
                        <p style={{ margin: 0, fontSize: '14px' }}>Reports submitted by victims will appear here.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => {
                    const reportTypeStyle = getReportTypeStyle(report.REPORT_TYPE || report.report_type);
                    return (
                      <tr key={report.REPORT_ID || report.report_id}>
                        <td><strong>#{report.REPORT_ID || report.report_id}</strong></td>
                        <td>
                          {report.DATE_REPORTED || report.date_reported 
                            ? new Date(report.DATE_REPORTED || report.date_reported).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'N/A'}
                        </td>
                        <td>
                          <div>{report.VICTIM_NAME || report.victim_name || report.REPORTED_BY || report.reported_by || 'Anonymous'}</div>
                          {(report.VICTIM_EMAIL || report.victim_email) && (
                            <div style={{ fontSize: '12px', color: '#666' }}>{report.VICTIM_EMAIL || report.victim_email}</div>
                          )}
                        </td>
                        <td>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: reportTypeStyle.bg,
                            color: reportTypeStyle.color
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
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => handleViewDetails(report.REPORT_ID || report.report_id)}
                              className="btn btn-sm btn-info"
                              title="View full report details"
                            >
                              📄 View
                            </button>
                            {(report.STATUS || report.status) === 'Pending Review' && (
                              <>
                                <button
                                  onClick={() => handleAcceptReport(report.REPORT_ID || report.report_id)}
                                  className="btn btn-sm btn-success"
                                  title="Accept report and create crime"
                                  style={{ background: '#43e97b', border: 'none' }}
                                >
                                  ✅ Accept
                                </button>
                                <button
                                  onClick={() => handleRejectReport(report.REPORT_ID || report.report_id)}
                                  className="btn btn-sm btn-danger"
                                  title="Reject this report"
                                  style={{ background: '#f5576c', border: 'none' }}
                                >
                                  ❌ Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleUpdateStatus(report.REPORT_ID || report.report_id, report.STATUS || report.status)}
                              className="btn btn-sm btn-warning"
                              title="Update report status"
                            >
                              ✏️ Status
                            </button>
                            <button
                              onClick={() => handleDeleteReport(report.REPORT_ID || report.report_id)}
                              className="btn btn-sm btn-danger"
                              title="Delete this report"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
