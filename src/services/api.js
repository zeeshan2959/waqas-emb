// API utility for Express.js Backend
const API_BASE_URL = 'https://waqas-emb-backend-1.onrender.com/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard');
  }

  // Collections
  async getCollections() {
    return this.request('/collections');
  }

  async getCollection(id) {
    return this.request(`/collections/${id}`);
  }

  async createCollection(data) {
    return this.request('/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCollection(id, data) {
    return this.request(`/collections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCollection(id) {
    return this.request(`/collections/${id}`, {
      method: 'DELETE',
    });
  }

  // Parties
  async getParties() {
    return this.request('/parties');
  }

  async getParty(id) {
    return this.request(`/parties/${id}`);
  }

  async createParty(data) {
    return this.request('/parties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateParty(id, data) {
    return this.request(`/parties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteParty(id) {
    return this.request(`/parties/${id}`, {
      method: 'DELETE',
    });
  }

  // Ghausia Lots
  async getGhausiaLots() {
    return this.request('/ghausiaLots');
  }

  async getGhausiaLot(id) {
    return this.request(`/ghausiaLots/${id}`);
  }

  async createGhausiaLot(data) {
    return this.request('/ghausiaLots', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGhausiaLot(id, data) {
    return this.request(`/ghausiaLots/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteGhausiaLot(id) {
    return this.request(`/ghausiaLots/${id}`, {
      method: 'DELETE',
    });
  }

  // Party Edits
  async getPartyEdits() {
    return this.request('/partyEdits');
  }

  async createPartyEdit(data) {
    return this.request('/partyEdits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePartyEdit(id, data) {
    return this.request(`/partyEdits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async upsertPartyEditByLotId(lotId, data) {
    return this.request(`/partyEdits/lot/${lotId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Party Ledger
  async getPartyLedger(partyId = null) {
    const endpoint = partyId ? `/partyLedger?partyId=${partyId}` : '/partyLedger';
    return this.request(endpoint);
  }

  async createLedgerEntry(data) {
    return this.request('/partyLedger', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Payments
  async getPayments() {
    return this.request('/payments');
  }

  async getPartyPayments(partyId) {
    return this.request(`/payments?partyId=${partyId}`);
  }

  async createPayment(data) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePayment(id, data) {
    return this.request(`/payments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePayment(id) {
    return this.request(`/payments/${id}`, {
      method: 'DELETE',
    });
  }

  // Rate Calculations
  async getRateCalculations() {
    return this.request('/rateCalculations');
  }

  async createRateCalculation(data) {
    return this.request('/rateCalculations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRateCalculation(id, data) {
    return this.request(`/rateCalculations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Saved Designs
  async getSavedDesigns() {
    return this.request('/savedDesigns');
  }

  async getSavedDesign(id) {
    return this.request(`/savedDesigns/${id}`);
  }

  async createSavedDesign(data) {
    return this.request('/savedDesigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSavedDesign(id, data) {
    return this.request(`/savedDesigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSavedDesign(id) {
    return this.request(`/savedDesigns/${id}`, {
      method: 'DELETE',
    });
  }

  // Cash Flow
  async getCashFlow() {
    return this.request('/cashFlow');
  }

  async createCashFlowEntry(data) {
    return this.request('/cashFlow', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
export default apiService;