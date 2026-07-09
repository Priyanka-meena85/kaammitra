export const saveCallLead = (worker) => {
  const leads = JSON.parse(localStorage.getItem('kaammitra_leads')) || [];
  const newLead = {
    id: Date.now().toString(),
    workerId: worker.id || worker._id,
    workerName: worker.name,
    service: worker.services?.[0] || 'Unknown',
    source: 'call',
    timestamp: new Date().toISOString(),
  };
  leads.push(newLead);
  localStorage.setItem('kaammitra_leads', JSON.stringify(leads));
};

export const saveWhatsAppLead = (worker) => {
  const leads = JSON.parse(localStorage.getItem('kaammitra_leads')) || [];
  const newLead = {
    id: Date.now().toString(),
    workerId: worker.id || worker._id,
    workerName: worker.name,
    service: worker.services?.[0] || 'Unknown',
    source: 'whatsapp',
    timestamp: new Date().toISOString(),
  };
  leads.push(newLead);
  localStorage.setItem('kaammitra_leads', JSON.stringify(leads));
};

export const saveEmergencyLead = (data) => {
  const leads = JSON.parse(localStorage.getItem('kaammitra_emergency_leads')) || [];
  const newLead = {
    id: Date.now().toString(),
    ...data,
    status: 'New',
    timestamp: new Date().toISOString(),
  };
  leads.push(newLead);
  localStorage.setItem('kaammitra_emergency_leads', JSON.stringify(leads));
};

export const getLeads = () => {
  return JSON.parse(localStorage.getItem('kaammitra_leads')) || [];
};

export const getEmergencyLeads = () => {
  return JSON.parse(localStorage.getItem('kaammitra_emergency_leads')) || [];
};

export const saveCallbackRequest = (data) => {
  const requests = JSON.parse(localStorage.getItem('kaammitra_callback_requests')) || [];
  const newRequest = {
    id: Date.now().toString(),
    ...data,
    status: 'New',
    timestamp: new Date().toISOString(),
  };
  requests.push(newRequest);
  localStorage.setItem('kaammitra_callback_requests', JSON.stringify(requests));
};

export const getCallbackRequests = () => {
  return JSON.parse(localStorage.getItem('kaammitra_callback_requests')) || [];
};
