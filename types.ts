
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  PAYPAL = 'PAYPAL'
}

export interface OutPartyEntry {
  id: string;
  index: number;
  method: PaymentMethod;
  amount: number;
}

export interface MainSectionEntry {
  id: string;
  roomNo: string;
  description: string;
  method: PaymentMethod;
  cashIn: number;
  cashOut: number;
}

export interface CashBookData {
  date: string;
  outPartyEntries: OutPartyEntry[];
  mainEntries: MainSectionEntry[];
  openingBalance: number;
}

export interface DailyArchive {
  date: string;
  data: CashBookData;
  finalBalance: number;
}

export interface DeviceState {
  currentData: CashBookData;
  history: DailyArchive[];
  rates: {
    usd: number;
    euro: number;
  };
}

export type DeviceType = 'laptop' | 'android' | 'iphone';
