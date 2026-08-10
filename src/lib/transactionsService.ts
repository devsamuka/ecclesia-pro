/// <reference types="vite/client" />
import { supabase } from './supabase';
import { Transaction } from '../types';

export const mapRowToTransaction = (row: any): Transaction => {
  return {
    id: String(row.id),
    type: row.type || 'Entrada',
    category: row.category || 'Outros',
    description: row.description || '',
    amount: Number(row.amount) || 0,
    date: row.date ? String(row.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
    memberName: row.member_name ?? row.memberName ?? undefined,
    memberId: row.member_id ?? row.memberId ?? undefined,
    isAnonymous:
      row.is_anonymous !== undefined
        ? Boolean(row.is_anonymous)
        : row.isAnonymous !== undefined
        ? Boolean(row.isAnonymous)
        : false,
    account: row.account || 'Conta Dízimos & Ofertas',
    paymentMethod: row.payment_method ?? row.paymentMethod ?? 'PIX',
    status: row.status || 'Concluído',
    receiptUrl: row.receipt_url ?? row.receiptUrl ?? undefined,
    notes: row.notes || undefined,
    destinationFund: row.destination_fund ?? row.destinationFund ?? 'Caixa Geral',
  };
};

export const mapTransactionToRow = (tx: Partial<Transaction>) => {
  return {
    type: tx.type,
    category: tx.category,
    description: tx.description,
    amount: tx.amount,
    date: tx.date,
    member_name: tx.memberName || null,
    member_id: tx.memberId || null,
    is_anonymous: tx.isAnonymous ?? false,
    account: tx.account,
    payment_method: tx.paymentMethod,
    status: tx.status || 'Concluído',
    receipt_url: tx.receiptUrl || null,
    notes: tx.notes || null,
    destination_fund: tx.destinationFund || 'Caixa Geral',
  };
};

export async function fetchTransactionsFromSupabase(): Promise<{
  data: Transaction[] | null;
  error: any;
}> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.warn('Aviso Supabase (fetchTransactions):', error.message || error);
      return { data: null, error };
    }

    if (!data) return { data: [], error: null };

    const mapped = data.map(mapRowToTransaction);
    return { data: mapped, error: null };
  } catch (err) {
    console.error('Exceção ao buscar transações no Supabase:', err);
    return { data: null, error: err };
  }
}

export async function createTransactionInSupabase(
  tx: Omit<Transaction, 'id'>
): Promise<{ data: Transaction | null; error: any }> {
  try {
    const rowPayload = mapTransactionToRow(tx);
    const { data, error } = await supabase
      .from('transactions')
      .insert([rowPayload])
      .select()
      .single();

    if (error) {
      console.warn('Erro ao inserir transação no Supabase:', error.message || error);
      return { data: null, error };
    }

    return { data: mapRowToTransaction(data), error: null };
  } catch (err) {
    console.error('Exceção ao criar transação no Supabase:', err);
    return { data: null, error: err };
  }
}

export async function updateTransactionInSupabase(
  id: string,
  tx: Partial<Transaction>
): Promise<{ data: Transaction | null; error: any }> {
  try {
    const rowPayload = mapTransactionToRow(tx);
    const { data, error } = await supabase
      .from('transactions')
      .update(rowPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('Erro ao atualizar transação no Supabase:', error.message || error);
      return { data: null, error };
    }

    return { data: mapRowToTransaction(data), error: null };
  } catch (err) {
    console.error('Exceção ao atualizar transação no Supabase:', err);
    return { data: null, error: err };
  }
}

export async function deleteTransactionFromSupabase(
  id: string
): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase.from('transactions').delete().eq('id', id);

    if (error) {
      console.warn('Erro ao deletar transação no Supabase:', error.message || error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Exceção ao deletar transação no Supabase:', err);
    return { success: false, error: err };
  }
}
