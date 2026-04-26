import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { investigationsAPI, officersAPI, crimesAPI } from '../../services/api';
import './Crimes.css';

const Investigations = () => {
  const [investigations, setInvestigations] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterOutcome, setFilterOutcome] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invResponse, officersResponse] = await Promise.all([
        investigationsAPI.getAll(),
        officersAPI.getAll()
      ]);
      console.log('🔍 Investigations loaded:', invResponse.data);
      setInvestigations(invResponse.data || []);
      setOfficers(officersResponse.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      Swal.fire('Error!', error.message || 'Failed to load investigations', 'error');
      setInvestigations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvestigation = async () => {
    // Generate auto case number
    const year = new Date().getFullYear();
    const nextNumber = String(investigations.length + 1).padStart(3, '0');
    const autoCaseNumber = `INV-${year}-${nextNumber}`;

    const { value: formValues } = await Swal.fire({
      title: '🔍 Create New Investigation',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Investigation ID</label>
            <input class="swal2-input" value="Auto-generated" disabled style="width: 90%; margin: 0; background: #f0f0f0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Case Number *</label>
            <input id="caseNumber" class="swal2-input" value="${autoCaseNumber}" style="width: 90%; margin: 0;">
            <small style="color: #666; font-size: 12px;">Auto-generated. You can modify if needed.</small>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Lead Officer</label>
            <select id="leadOfficerId" class="swal2-input" style="width: 90%; margin: 0;">
              <option value="">Select officer (optional)</option>
              ${officers.map(o => `<option value="${o.OFFICER_ID}">${o.NAME} (#${o.OFFICER_ID})</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Start Date *</label>
            <input id="startDate" type="date" class="swal2-input" value="${new Date().toISOString().split('T')[0]}" style="width: 90%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Status *</label>
            <select id="status" class="swal2-input" style="width: 90%; margin: 0;">
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Cold Case">Cold Case</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Notes</label>
            <textarea id="notes" class="swal2-textarea" placeholder="Investigation notes..." style="width: 90%; margin: 0; min-height: 80px;"></textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Create Investigation',
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#d33',
      width: '550px',
      preConfirm: () => {
        const caseNumber = document.getElementById('caseNumber').value;
        const leadOfficerId = document.getElementById('leadOfficerId').value;
        const startDate = document.getElementById('startDate').value;
        const status = document.getElementById('status').value;
        const notes = document.getElementById('notes').value;

        if (!caseNumber || !startDate) {
          Swal.showValidationMessage('Case Number and Start Date are required');
          return false;
        }

        return { 
          caseNumber, 
          leadOfficerId: leadOfficerId || null,
          startDate, 
          status,
          notes: notes || null
        };
      }
    });

    if (formValues) {
      try {
        await investigationsAPI.create(formValues);
        Swal.fire({
          icon: 'success',
          title: 'Investigation Created!',
          text: 'New investigation has been created successfully.',
          confirmButtonColor: '#667eea'
        });
        loadData();
      } catch (error) {
        console.error('Failed to create investigation:', error);
        Swal.fire('Error!', error.message || 'Failed to create investigation', 'error');
      }
    }
  };

  const handleUpdateStatus = async (investigation) => {
    const { value: formValues } = await Swal.fire({
      title: `Update Investigation #${investigation.INVESTIGATION_ID}`,
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Status</label>
            <select id="status" class="swal2-input" style="width: 90%; margin: 0;">
              <option value="Active" ${investigation.STATUS === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Suspended" ${investigation.STATUS === 'Suspended' ? 'selected' : ''}>Suspended</option>
              <option value="Cold Case" ${investigation.STATUS === 'Cold Case' ? 'selected' : ''}>Cold Case</option>
              <option value="Closed" ${investigation.STATUS === 'Closed' ? 'selected' : ''}>Closed</option>
            </select>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Outcome</label>
            <select id="outcome" class="swal2-input" style="width: 90%; margin: 0;">
              <option value="Pending" ${investigation.OUTCOME === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Solved" ${investigation.OUTCOME === 'Solved' ? 'selected' : ''}>Solved</option>
              <option value="Unsolved" ${investigation.OUTCOME === 'Unsolved' ? 'selected' : ''}>Unsolved</option>
              <option value="No Crime" ${investigation.OUTCOME === 'No Crime' ? 'selected' : ''}>No Crime</option>
            </select>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Close Date (if closing)</label>
            <input id="closeDate" type="date" class="swal2-input" value="${investigation.CLOSE_DATE || ''}" style="width: 90%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Notes</label>
            <textarea id="notes" class="swal2-textarea" placeholder="Update notes..." style="width: 90%; margin: 0; min-height: 80px;">${investigation.NOTES || ''}</textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update',
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#d33',
      width: '550px',
      preConfirm: () => {
        const status = document.getElementById('status').value;
        const outcome = document.getElementById('outcome').value;
        const closeDate = document.getElementById('closeDate').value;
        const notes = document.getElementById('notes').value;

        return { status, outcome, closeDate: closeDate || null, notes };
      }
    });

    if (formValues) {
      try {
        await investigationsAPI.update(investigation.INVESTIGATION_ID, formValues);
        Swal.fire({
          icon: 'success',
          title: 'Investigation Updated!',
          confirmButtonColor: '#667eea'
        });
        loadData();
      } catch (error) {
        console.error('Failed to update investigation:', error);
        Swal.fire('Error!', error.message || 'Failed to update investigation', 'error');
      }
    }
  };

  const handleAssignOfficer = async (investigation) => {
    const { value: officerId } = await Swal.fire({
      title: 'Assign Officer',
      html: `
        <select id="officer" class="swal2-select" style="width: 80%;">
          <option value="">Select officer</option>
          ${officers.map(o => `
            <option value="${o.OFFICER_ID}" ${investigation.LEAD_OFFICER_ID === o.OFFICER_ID ? 'selected' : ''}>
              ${o.NAME} (#${o.OFFICER_ID})
            </option>
          `).join('')}
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Assign',
      confirmButtonColor: '#667eea',
      preConfirm: () => {
        return document.getElementById('officer').value;
      }
    });

    if (officerId) {
      try {
        await investigationsAPI.assignOfficer(investigation.INVESTIGATION_ID, officerId);
        Swal.fire({
          icon: 'success',
          title: 'Officer Assigned!',
          confirmButtonColor: '#667eea'
        });
        loadData();
      } catch (error) {
        console.error('Failed to assign officer:', error);
        Swal.fire('Error!', error.message || 'Failed to assign officer', 'error');
      }
    }
  };

  const handleLinkCrime = async (investigation) => {
    const { value: crimeId } = await Swal.fire({
      title: 'Link Crime to Investigation',
      input: 'number',
      inputLabel: 'Crime ID',
      inputPlaceholder: 'Enter crime ID',
      showCancelButton: true,
      confirmButtonText: 'Link Crime',
      confirmButtonColor: '#667eea',
      inputValidator: (value) => {
        if (!value) {
          return 'Please enter a crime ID';
        }
      }
    });

    if (crimeId) {
      try {
        await investigationsAPI.linkCrime(investigation.INVESTIGATION_ID, crimeId);
        Swal.fire({
          icon: 'success',
          title: 'Crime Linked!',
          text: `Crime #${crimeId} has been linked to this investigation.`,
          confirmButtonColor: '#667eea'
        });
      } catch (error) {
        console.error('Failed to link crime:', error);
        Swal.fire('Error!', error.message || 'Failed to link crime', 'error');
      }
    }
  };

  const handleDelete = async (investigation) => {
    const result = await Swal.fire({
      title: 'Delete Investigation?',
      text: `Are you sure you want to delete investigation "${investigation.CASE_NUMBER}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#667eea',
      confirmButtonText: 'Yes, delete it'
    });

    if (result.isConfirmed) {
      try {
        await investigationsAPI.delete(investigation.INVESTIGATION_ID);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Investigation has been deleted.',
          confirmButtonColor: '#667eea'
        });
        loadData();
      } catch (error) {
        console.error('Failed to delete investigation:', error);
        Swal.fire('Error!', error.message || 'Failed to delete investigation', 'error');
      }
    }
  };

  const handleViewDetails = async (investigation) => {
    let linkedCrimes = [];
    let inv = investigation;
    let teamMembers = [];

    try {
      const [detailsResp, teamResp] = await Promise.all([
        investigationsAPI.getById(investigation.INVESTIGATION_ID),
        investigationsAPI.getTeam(investigation.INVESTIGATION_ID).catch(() => ({ data: [] }))
      ]);
      if (detailsResp && detailsResp.data) {
        inv = detailsResp.data.investigation || investigation;
        linkedCrimes = detailsResp.data.linkedCrimes || [];
      }
      if (teamResp && teamResp.data) {
        teamMembers = teamResp.data;
      }
    } catch (err) {
      // Fall back to existing data
    }

    const showDetailsPopup = (team) => {
      const teamHtml = team.map(member => `
        <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 8px; background: white; border-radius: 6px; margin-bottom: 6px;">
          <span style="background: #7b1fa2; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; white-space: nowrap;">${member.ROLE || 'Field Officer'}</span>
          <strong style="flex: 1;">${member.NAME}</strong>
          <span style="color: #888; font-size: 12px;">${member.EMAIL || ''}</span>
          <button data-officer-id="${member.OFFICER_ID}" class="removeTeamBtn" style="background: #ef5350; color: white; border: none; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; flex-shrink: 0;">✕ Remove</button>
        </div>
      `).join('');

      const detailsHtml = `
        <div style="text-align: left; max-height: 600px; overflow-y: auto; padding-right: 5px;">

          <!-- Investigation Details -->
          <div style="margin-bottom: 20px; background: #f8f9fa; padding: 15px; border-radius: 10px; border-left: 4px solid #667eea;">
            <h4 style="color: #333; margin: 0 0 12px 0; font-size: 15px;">🔍 Investigation Details</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
              <div><span style="color:#888;">ID:</span> <strong>#${inv.INVESTIGATION_ID}</strong></div>
              <div><span style="color:#888;">Case Number:</span> <strong>${inv.CASE_NUMBER}</strong></div>
              <div><span style="color:#888;">Lead Officer:</span> <strong>${inv.LEAD_OFFICER_NAME || 'Unassigned'}</strong></div>
              <div><span style="color:#888;">Start Date:</span> <strong>${inv.START_DATE || 'N/A'}</strong></div>
              <div><span style="color:#888;">Close Date:</span> <strong>${inv.CLOSE_DATE || 'Not closed'}</strong></div>
              <div><span style="color:#888;">Status:</span> <strong style="color:${inv.STATUS === 'Active' ? '#1976d2' : inv.STATUS === 'Closed' ? '#2e7d32' : '#f57c00'};">${inv.STATUS}</strong></div>
              <div><span style="color:#888;">Outcome:</span> <strong style="color:${inv.OUTCOME === 'Solved' ? '#2e7d32' : inv.OUTCOME === 'Pending' ? '#f57c00' : '#d32f2f'};">${inv.OUTCOME}</strong></div>
            </div>
            ${inv.NOTES ? `<div style="margin-top: 10px; font-size: 13px;"><span style="color:#888;">Notes:</span><div style="background: white; padding: 8px; border-radius: 5px; margin-top: 5px; white-space: pre-wrap;">${inv.NOTES}</div></div>` : ''}
          </div>

          <!-- Linked Crimes -->
          <div style="margin-bottom: 20px;">
            <h4 style="color: #333; margin: 0 0 10px 0; font-size: 15px;">🚨 Linked Crimes (${linkedCrimes.length})</h4>
            ${linkedCrimes.length > 0 ? linkedCrimes.map(crime => `
              <div style="background: #e3f2fd; padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #2196F3;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 13px;">
                  <div><span style="color:#888;">Crime ID:</span> <strong>#${crime.CRIME_ID}</strong></div>
                  <div><span style="color:#888;">Type:</span> <strong>${crime.CRIME_TYPE || 'N/A'}</strong></div>
                  <div><span style="color:#888;">Date:</span> <strong>${crime.DATE_OCCURRED || 'N/A'}</strong></div>
                  <div><span style="color:#888;">Status:</span> <strong>${crime.STATUS || 'N/A'}</strong></div>
                </div>
                ${crime.DESCRIPTION ? `<div style="margin-top: 6px; font-size: 12px; color:#555;"><em>${crime.DESCRIPTION.substring(0, 150)}${crime.DESCRIPTION.length > 150 ? '...' : ''}</em></div>` : ''}
              </div>
            `).join('') : `
              <div style="background: #fff3cd; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107; font-size: 13px; color: #856404;">
                ⚠️ No crimes linked yet. Use the 🔗 button to link crimes.
              </div>
            `}
          </div>

          <!-- Investigation Team -->
          <div style="margin-bottom: 20px; background: #f3e5f5; padding: 15px; border-radius: 10px; border-left: 4px solid #9c27b0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h4 style="color: #333; margin: 0; font-size: 15px;">👮 Investigation Team (${(team.length + (inv.LEAD_OFFICER_NAME ? 1 : 0))} members)</h4>
              <button id="addTeamMemberBtn" style="background: #9c27b0; color: white; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">+ Add Member</button>
            </div>
            ${inv.LEAD_OFFICER_NAME ? `
              <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 8px; background: white; border-radius: 6px; margin-bottom: 6px;">
                <span style="background: #9c27b0; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; white-space: nowrap;">Lead Officer</span>
                <strong style="flex: 1;">${inv.LEAD_OFFICER_NAME}</strong>
                ${inv.LEAD_OFFICER_EMAIL ? `<span style="color: #666; font-size: 12px;">${inv.LEAD_OFFICER_EMAIL}</span>` : ''}
              </div>
            ` : ''}
            ${teamHtml}
            ${team.length === 0 && !inv.LEAD_OFFICER_NAME ? `
              <div style="font-size: 13px; color: #856404; background: #fff3cd; padding: 10px; border-radius: 6px;">⚠️ No team members assigned. Click "+ Add Member" to add officers.</div>
            ` : ''}
          </div>

          <!-- Action Hint -->
          <div style="background: #e8f5e9; padding: 12px; border-radius: 8px; font-size: 12px; color: #2e7d32; text-align: center;">
            💡 Use the table action buttons to update status, assign lead officer, link crimes, or delete.
          </div>
        </div>
      `;

      Swal.fire({
        title: `📁 Case File: ${inv.CASE_NUMBER || investigation.CASE_NUMBER}`,
        html: detailsHtml,
        width: '750px',
        confirmButtonText: 'Close',
        confirmButtonColor: '#667eea',
        didOpen: (popup) => {
          const addBtn = popup.querySelector('#addTeamMemberBtn');
          if (addBtn) {
            addBtn.addEventListener('click', () => {
              Swal.close();
              handleAddTeamMemberModal(inv, team, showDetailsPopup);
            });
          }
          popup.querySelectorAll('.removeTeamBtn').forEach(btn => {
            btn.addEventListener('click', async () => {
              const officerId = btn.getAttribute('data-officer-id');
              const memberName = btn.closest('div').querySelector('strong') ? btn.closest('div').querySelector('strong').textContent : 'this officer';
              Swal.fire({
                title: 'Remove Team Member?',
                text: `Remove ${memberName} from this investigation team?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef5350',
                cancelButtonColor: '#9e9e9e',
                confirmButtonText: 'Remove',
              }).then(async (result) => {
                if (result.isConfirmed) {
                  try {
                    await investigationsAPI.removeTeamMember(inv.INVESTIGATION_ID, officerId);
                    const updatedTeamResp = await investigationsAPI.getTeam(inv.INVESTIGATION_ID).catch(() => ({ data: [] }));
                    const updatedTeam = (updatedTeamResp && updatedTeamResp.data) ? updatedTeamResp.data : [];
                    showDetailsPopup(updatedTeam);
                  } catch (err) {
                    Swal.fire('Error', 'Failed to remove team member', 'error');
                  }
                }
              });
            });
          });
        }
      });
    };

    showDetailsPopup(teamMembers);
  };

  const handleAddTeamMemberModal = async (inv, currentTeam, onBack) => {
    const assignedIds = [inv.LEAD_OFFICER_ID, ...currentTeam.map(m => m.OFFICER_ID)].filter(Boolean).map(String);
    const availableOfficers = officers.filter(o => !assignedIds.includes(String(o.OFFICER_ID)));

    if (availableOfficers.length === 0) {
      Swal.fire({
        title: 'No Officers Available',
        text: 'All officers are already assigned to this investigation.',
        icon: 'info',
        confirmButtonColor: '#667eea'
      }).then(() => onBack && onBack(currentTeam));
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: '👮 Add Team Member',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px;">Officer *</label>
            <select id="swal-officer" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
              <option value="">Select Officer</option>
              ${availableOfficers.map(o => `<option value="${o.OFFICER_ID}">${o.NAME}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="display: block; font-weight: 600; margin-bottom: 5px;">Role</label>
            <select id="swal-role" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
              <option value="Field Officer">Field Officer</option>
              <option value="Detective">Detective</option>
              <option value="Forensics">Forensics</option>
              <option value="Analyst">Analyst</option>
              <option value="Support">Support</option>
            </select>
          </div>
        </div>
      `,
      width: '480px',
      showCancelButton: true,
      confirmButtonText: 'Add to Team',
      confirmButtonColor: '#9c27b0',
      cancelButtonColor: '#9e9e9e',
      preConfirm: () => {
        const officerId = document.getElementById('swal-officer').value;
        const role = document.getElementById('swal-role').value;
        if (!officerId) {
          Swal.showValidationMessage('Please select an officer');
          return false;
        }
        return { officerId, role };
      }
    });

    if (formValues) {
      try {
        await investigationsAPI.addTeamMember(inv.INVESTIGATION_ID, parseInt(formValues.officerId), formValues.role);
        await Swal.fire({ title: 'Added!', text: 'Team member added successfully.', icon: 'success', timer: 1200, showConfirmButton: false });
        const updatedTeamResp = await investigationsAPI.getTeam(inv.INVESTIGATION_ID).catch(() => ({ data: [] }));
        const updatedTeam = (updatedTeamResp && updatedTeamResp.data) ? updatedTeamResp.data : [];
        if (onBack) onBack(updatedTeam);
      } catch (err) {
        const msg = err.message && err.message.includes('already') ? 'Officer is already on this team.' : (err.message || 'Failed to add team member');
        Swal.fire('Error', msg, 'error').then(() => onBack && onBack(currentTeam));
      }
    } else {
      // Cancelled — return to details popup
      if (onBack) onBack(currentTeam);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('closed')) return 'status-solved';
    if (statusLower.includes('active')) return 'status-investigating';
    if (statusLower.includes('suspended')) return 'status-pending';
    return 'status-unsolved';
  };

  const getOutcomeBadgeClass = (outcome) => {
    const outcomeLower = (outcome || '').toLowerCase();
    if (outcomeLower.includes('solved')) return 'status-solved';
    if (outcomeLower.includes('pending')) return 'status-pending';
    return 'status-unsolved';
  };

  const filteredInvestigations = investigations.filter(inv => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = (
      (inv.CASE_NUMBER || '').toLowerCase().includes(search) ||
      (inv.LEAD_OFFICER_NAME || '').toLowerCase().includes(search) ||
      (inv.INVESTIGATION_ID || '').toString().includes(search) ||
      (inv.LINKED_CRIME_IDS || '').toString().includes(search)
    );
    const matchesStatus = !filterStatus || inv.STATUS === filterStatus;
    const matchesOutcome = !filterOutcome || inv.OUTCOME === filterOutcome;
    
    return matchesSearch && matchesStatus && matchesOutcome;
  });

  return (
    <div className="investigations-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">🔍 Investigations Management</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>
            Track and manage criminal investigations
          </p>
        </div>
        <button onClick={handleAddInvestigation} className="btn btn-primary">
          + Create Investigation
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
              {investigations.length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Investigations</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
              {investigations.filter(i => i.STATUS === 'Active').length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Active Cases</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
              {investigations.filter(i => i.OUTCOME === 'Solved').length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Solved Cases</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
              {investigations.filter(i => i.STATUS === 'Cold Case').length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Cold Cases</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '15px',
          marginBottom: '20px'
        }}>
          <input
            type="text"
            placeholder="🔍 Search by case number, officer, ID, or crime ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '12px 20px',
              fontSize: '14px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              outline: 'none'
            }}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '12px 20px',
              fontSize: '14px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              outline: 'none'
            }}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
            <option value="Suspended">Suspended</option>
            <option value="Cold Case">Cold Case</option>
          </select>
          <select
            value={filterOutcome}
            onChange={(e) => setFilterOutcome(e.target.value)}
            style={{
              padding: '12px 20px',
              fontSize: '14px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              outline: 'none'
            }}
          >
            <option value="">All Outcomes</option>
            <option value="Pending">Pending</option>
            <option value="Solved">Solved</option>
            <option value="Unsolved">Unsolved</option>
            <option value="No Crime">No Crime</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading investigations...</p>
          </div>
        ) : (
          <div className="table-container">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Case Number</th>
                    <th>Lead Officer</th>
                    <th>Linked Crimes</th>
                    <th>Start Date</th>
                    <th>Status</th>
                    <th>Outcome</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvestigations.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ color: '#999', fontSize: '18px' }}>
                          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔍</div>
                          <p style={{ margin: '0 0 10px 0', fontWeight: '500' }}>
                            {searchTerm || filterStatus || filterOutcome ? 'No investigations found' : 'No investigations yet'}
                          </p>
                          <p style={{ margin: 0, fontSize: '14px' }}>
                            {searchTerm || filterStatus || filterOutcome ? 'Try adjusting your filters' : 'Click "Create Investigation" to start a new investigation'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInvestigations.map((inv) => (
                      <tr key={inv.INVESTIGATION_ID}>
                        <td><strong>#{inv.INVESTIGATION_ID}</strong></td>
                        <td><strong>{inv.CASE_NUMBER}</strong></td>
                        <td>{inv.LEAD_OFFICER_NAME || 'Unassigned'}</td>
                        <td>
                          {inv.LINKED_CRIME_IDS ? (
                            <span style={{ color: '#667eea', fontWeight: '500' }}>
                              #{inv.LINKED_CRIME_IDS.split(', ').join(', #')}
                            </span>
                          ) : (
                            <span style={{ color: '#999', fontSize: '12px' }}>No crimes</span>
                          )}
                        </td>
                        <td>{inv.START_DATE}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(inv.STATUS)}`}>
                            {inv.STATUS}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${getOutcomeBadgeClass(inv.OUTCOME)}`}>
                            {inv.OUTCOME}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => handleViewDetails(inv)}
                              className="btn btn-sm btn-info"
                              title="View details"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(inv)}
                              className="btn btn-sm btn-warning"
                              title="Update status"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleAssignOfficer(inv)}
                              className="btn btn-sm btn-primary"
                              title="Assign officer"
                            >
                              👮
                            </button>
                            <button
                              onClick={() => handleLinkCrime(inv)}
                              className="btn btn-sm btn-success"
                              title="Link crime"
                            >
                              🔗
                            </button>
                            <button
                              onClick={() => handleDelete(inv)}
                              className="btn btn-sm btn-danger"
                              title="Delete investigation"
                            >
                              🗑️
                            </button>
                          </div>
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
  );
};

export default Investigations;
