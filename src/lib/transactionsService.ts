import { supabase } from './supabase';
import {
  Transaction,
  ChurchAccount,
  UpcomingBill,
  Member,
  MonthlyBudget,
  SuperiorPayment,
} from '../types';

// ==========================================
// 1. TRANSAÇÕES (TRANSACTIONS)
// ==========================================
export async function fetchTransactionsFromSupabase() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  if (error) return { data: null, error };

  const mapped: Transaction[] = data.map((item) => ({
    id: item.id,
    type: item.type,
    category: item.category,
    description: item.description,
    amount: Number(item.amount),
    date: item.date,
    memberName: item.member_name,
    memberId: item.member_id,
    isAnonymous: item.is_anonymous,
    account: item.account,
    paymentMethod: item.payment_method,
    status: item.status,
    receiptUrl: item.receipt_url,
    notes: item.notes,
    destinationFund: item.destination_fund,
  }));

  return { data: mapped, error: null };
}

export async function createTransactionInSupabase(tx: Omit<Transaction, 'id'>) {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      type: tx.type,
      category: tx.category,
      description: tx.description,
      amount: tx.amount,
      date: tx.date,
      member_name: tx.memberName || null,
      member_id: tx.memberId || null,
      is_anonymous: tx.isAnonymous || false,
      account: tx.account,
      payment_method: tx.paymentMethod,
      status: tx.status || 'Concluído',
      receipt_url: tx.receiptUrl || null,
      notes: tx.notes || null,
      destination_fund: tx.destinationFund || null,
    })
    .select()
    .single();

  if (error) return { data: null, error };

  const mapped: Transaction = {
    id: data.id,
    type: data.type,
    category: data.category,
    description: data.description,
    amount: Number(data.amount),
    date: data.date,
    memberName: data.member_name,
    memberId: data.member_id,
    isAnonymous: data.is_anonymous,
    account: data.account,
    paymentMethod: data.payment_method,
    status: data.status,
    receiptUrl: data.receipt_url,
    notes: data.notes,
    destinationFund: data.destination_fund,
  };

  return { data: mapped, error: null };
}

export async function updateTransactionInSupabase(id: string, tx: Partial<Transaction>) {
  const payload: Record<string, any> = {};
  if (tx.type) payload.type = tx.type;
  if (tx.category) payload.category = tx.category;
  if (tx.description) payload.description = tx.description;
  if (tx.amount !== undefined) payload.amount = tx.amount;
  if (tx.date) payload.date = tx.date;
  if (tx.memberName !== undefined) payload.member_name = tx.memberName;
  if (tx.memberId !== undefined) payload.member_id = tx.memberId;
  if (tx.isAnonymous !== undefined) payload.is_anonymous = tx.isAnonymous;
  if (tx.account) payload.account = tx.account;
  if (tx.paymentMethod) payload.payment_method = tx.paymentMethod;
  if (tx.status) payload.status = tx.status;
  if (tx.receiptUrl !== undefined) payload.receipt_url = tx.receiptUrl;
  if (tx.notes !== undefined) payload.notes = tx.notes;
  if (tx.destinationFund !== undefined) payload.destination_fund = tx.destinationFund;

  const { data, error } = await supabase
    .from('transactions')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) return { data: null, error };

  const mapped: Transaction = {
    id: data.id,
    type: data.type,
    category: data.category,
    description: data.description,
    amount: Number(data.amount),
    date: data.date,
    memberName: data.member_name,
    memberId: data.member_id,
    isAnonymous: data.is_anonymous,
    account: data.account,
    paymentMethod: data.payment_method,
    status: data.status,
    receiptUrl: data.receipt_url,
    notes: data.notes,
    destinationFund: data.destination_fund,
  };

  return { data: mapped, error: null };
}

export async function deleteTransactionFromSupabase(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  return { error };
}

// ==========================================
// 2. DEMAIS ENTIDADES (BUSCA DE DADOS REAIS)
// ==========================================
export async function fetchAccountsFromSupabase() {
  const { data, error } = await supabase.from('accounts').select('*').order('name');
  if (error) return { data: null, error };

  const mapped: ChurchAccount[] = data.map((item) => ({
    id: item.id,
    name: item.name,
    bankName: item.bank_name,
    accountNumber: item.account_number,
    balance: Number(item.balance),
    type: item.type,
  }));

  return { data: mapped, error: null };
}

export async function fetchUpcomingBillsFromSupabase() {
  const { data, error } = await supabase.from('upcoming_bills').select('*').order('due_date');
  if (error) return { data: null, error };

  const mapped: UpcomingBill[] = data.map((item) => ({
    id: item.id,
    supplier: item.supplier,
    category: item.category,
    amount: Number(item.amount),
    dueDate: item.due_date,
    account: item.account,
    status: item.status,
    notes: item.notes,
  }));

  return { data: mapped, error: null };
}

export async function fetchMembersFromSupabase() {
  const { data, error } = await supabase.from('members').select('*').order('name');
  if (error) return { data: null, error };

  const mapped: Member[] = data.map((item) => ({
    id: item.id,
    name: item.name,
    phone: item.phone,
    email: item.email,
    status: item.status,
    role: item.role,
  }));

  return { data: mapped, error: null };
}
