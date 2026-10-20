/**
 * GMC FINSEC BILLING ENGINE - OPENPAY COLOMBIA REST CLIENT
 * (C) German Morales Consulting (GM CONSULTING)
 * 
 * Implementación bancaria segura con HTTP Basic Auth, manejo de errores detallado,
 * soporte para planes con trial_days parametrizable y cero secrets hardcodeados.
 */

import { getOpenpayConfig, OpenpayServerConfig } from '../../core/config';

export interface OpenpayCustomerResponse {
  id: string;
  name: string;
  email: string;
  external_id?: string;
  creation_date: string;
}

export interface OpenpayCardResponse {
  id: string;
  type: string;
  brand: string;
  card_number: string;
  holder_name: string;
  expiration_year: string;
  expiration_month: string;
  bank_name?: string;
}

export interface OpenpayPlanResponse {
  id: string;
  name: string;
  amount: number;
  currency: string;
  repeat_every: number;
  repeat_unit: 'month' | 'year' | 'week';
  retry_times: number;
  status_after_retry: 'unpaid' | 'cancelled';
  trial_days: number;
}

export interface OpenpaySubscriptionResponse {
  id: string;
  status: 'trial' | 'active' | 'past_due' | 'unpaid' | 'cancelled';
  current_period_end_date: string;
  cancel_at_period_end?: boolean;
  charge_date?: string;
  creation_date: string;
  card?: OpenpayCardResponse;
  plan_id: string;
  customer_id: string;
}

export interface OpenpayChargeResponse {
  id: string;
  amount: number;
  authorization?: string;
  method: string;
  operation_type: string;
  transaction_type: string;
  card?: OpenpayCardResponse;
  status: 'completed' | 'in_progress' | 'failed' | 'cancelled';
  order_id?: string;
  description?: string;
  error_message?: string;
  creation_date: string;
}

export class OpenpayClient {
  private merchantId: string;
  private privateKey: string;
  private apiBaseUrl: string;

  constructor(customConfig?: Partial<OpenpayServerConfig>) {
    const config = getOpenpayConfig();
    this.merchantId = customConfig?.OPENPAY_MERCHANT_ID || config.OPENPAY_MERCHANT_ID;
    this.privateKey = customConfig?.OPENPAY_PRIVATE_KEY || config.OPENPAY_PRIVATE_KEY;
    this.apiBaseUrl = customConfig?.apiBaseUrl || config.apiBaseUrl;
  }

  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.privateKey}:`).toString('base64');
    return `Basic ${credentials}`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.apiBaseUrl}/${this.merchantId}${endpoint}`;
    const headers = {
      'Authorization': this.getAuthHeader(),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.description || data?.error_code || response.statusText;
      const errorCode = data?.error_code || response.status;
      const error = new Error(`[OPENPAY_API_ERROR ${errorCode}] ${errorMsg}`);
      (error as any).statusCode = response.status;
      (error as any).details = data;
      throw error;
    }

    return data as T;
  }

  // ==========================================
  // CLIENTES (Customers)
  // ==========================================
  async createCustomer(params: {
    name: string;
    email: string;
    external_id?: string;
  }): Promise<OpenpayCustomerResponse> {
    return this.request<OpenpayCustomerResponse>('/customers', {
      method: 'POST',
      body: JSON.stringify({
        name: params.name,
        email: params.email,
        requires_account: false,
        external_id: params.external_id,
      }),
    });
  }

  async getCustomer(customerId: string): Promise<OpenpayCustomerResponse> {
    return this.request<OpenpayCustomerResponse>(`/customers/${customerId}`, {
      method: 'GET',
    });
  }

  // ==========================================
  // TARJETAS (Cards vinculadas a un cliente)
  // ==========================================
  async addCardToCustomer(params: {
    customerId: string;
    tokenId: string;
    deviceSessionId: string;
  }): Promise<OpenpayCardResponse> {
    return this.request<OpenpayCardResponse>(`/customers/${params.customerId}/cards`, {
      method: 'POST',
      body: JSON.stringify({
        token_id: params.tokenId,
        device_session_id: params.deviceSessionId,
      }),
    });
  }

  async listCustomerCards(customerId: string): Promise<OpenpayCardResponse[]> {
    return this.request<OpenpayCardResponse[]>(`/customers/${customerId}/cards`, {
      method: 'GET',
    });
  }

  async deleteCustomerCard(customerId: string, cardId: string): Promise<void> {
    await this.request(`/customers/${customerId}/cards/${cardId}`, {
      method: 'DELETE',
    });
  }

  // ==========================================
  // PLANES DE SUSCRIPCIÓN (Plans)
  // ==========================================
  async createPlan(params: {
    name: string;
    amount: number;
    currency?: string;
    repeatEvery?: number;
    repeatUnit?: 'month' | 'year';
    retryTimes?: number;
    statusAfterRetry?: 'unpaid' | 'cancelled';
    trialDays?: number;
  }): Promise<OpenpayPlanResponse> {
    return this.request<OpenpayPlanResponse>('/plans', {
      method: 'POST',
      body: JSON.stringify({
        name: params.name,
        amount: params.amount,
        currency: params.currency || 'COP',
        repeat_every: params.repeatEvery || 1,
        repeat_unit: params.repeatUnit || 'month',
        retry_times: params.retryTimes ?? 2,
        status_after_retry: params.statusAfterRetry || 'unpaid',
        trial_days: params.trialDays ?? 0,
      }),
    });
  }

  async getPlan(planId: string): Promise<OpenpayPlanResponse> {
    return this.request<OpenpayPlanResponse>(`/plans/${planId}`, {
      method: 'GET',
    });
  }

  async listPlans(): Promise<OpenpayPlanResponse[]> {
    return this.request<OpenpayPlanResponse[]>('/plans', {
      method: 'GET',
    });
  }

  // ==========================================
  // SUSCRIPCIONES (Subscriptions)
  // ==========================================
  async createSubscription(params: {
    customerId: string;
    planId: string;
    cardId: string;
    trialEndDate?: string; // Formato YYYY-MM-DD
  }): Promise<OpenpaySubscriptionResponse> {
    const body: Record<string, any> = {
      plan_id: params.planId,
      card_id: params.cardId,
    };
    if (params.trialEndDate) {
      body.trial_end_date = params.trialEndDate;
    }

    return this.request<OpenpaySubscriptionResponse>(
      `/customers/${params.customerId}/subscriptions`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  }

  async getSubscription(customerId: string, subscriptionId: string): Promise<OpenpaySubscriptionResponse> {
    return this.request<OpenpaySubscriptionResponse>(
      `/customers/${customerId}/subscriptions/${subscriptionId}`,
      {
        method: 'GET',
      }
    );
  }

  async cancelSubscription(customerId: string, subscriptionId: string): Promise<void> {
    await this.request(
      `/customers/${customerId}/subscriptions/${subscriptionId}`,
      {
        method: 'DELETE',
      }
    );
  }

  async updateSubscriptionCard(params: {
    customerId: string;
    subscriptionId: string;
    cardId: string;
  }): Promise<OpenpaySubscriptionResponse> {
    return this.request<OpenpaySubscriptionResponse>(
      `/customers/${params.customerId}/subscriptions/${params.subscriptionId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          card_id: params.cardId,
        }),
      }
    );
  }

  // ==========================================
  // CARGOS Y REEMBOLSOS (Charges & Refunds)
  // ==========================================
  async getCharge(chargeId: string): Promise<OpenpayChargeResponse> {
    return this.request<OpenpayChargeResponse>(`/charges/${chargeId}`, {
      method: 'GET',
    });
  }

  async refundCharge(params: {
    chargeId: string;
    description: string;
    amount?: number;
  }): Promise<OpenpayChargeResponse> {
    const body: Record<string, any> = {
      description: params.description,
    };
    if (params.amount) {
      body.amount = params.amount;
    }

    return this.request<OpenpayChargeResponse>(`/charges/${params.chargeId}/refund`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // ==========================================
  // HOSTED CHECKOUT (PCI-DSS SAQ-A Redirection)
  // ==========================================
  async createHostedCheckout(params: {
    amount: number;
    description: string;
    orderId: string;
    customer: {
      name: string;
      lastName?: string;
      email: string;
      phoneNumber?: string;
    };
    redirectUrl: string;
    currency?: string;
  }): Promise<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    order_id?: string;
    payment_method?: {
      type: string;
      url: string;
    };
  }> {
    const body = {
      method: 'card',
      amount: params.amount,
      currency: params.currency || 'COP',
      description: params.description,
      order_id: params.orderId,
      customer: {
        name: params.customer.name,
        last_name: params.customer.lastName || 'Atleta',
        email: params.customer.email,
        phone_number: params.customer.phoneNumber || '3000000000',
      },
      confirm: false,
      send_email: false,
      redirect_url: params.redirectUrl,
    };

    return this.request<{
      id: string;
      amount: number;
      currency: string;
      status: string;
      order_id?: string;
      payment_method?: {
        type: string;
        url: string;
      };
    }>('/charges', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}
