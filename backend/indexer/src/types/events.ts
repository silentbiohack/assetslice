export interface SharesBoughtEvent {
  buyer: string;
  mint: string;
  amount: string;
  totalPaid: string;
}

export interface SharesSoldEvent {
  seller: string;
  mint: string;
  amount: string;
  totalReceived: string;
}

export interface DividendOpenedEvent {
  dividend: string;
  asset: string;
  totalAmount: string;
  supplyCircAtOpen: string;
}

export interface DividendClaimedEvent {
  dividend: string;
  holder: string;
  amount: string;
}

export interface DividendClosedEvent {
  dividend: string;
  remainingAmount: string;
}

export type ProgramEvent = 
  | { name: 'SharesBought'; data: SharesBoughtEvent }
  | { name: 'SharesSold'; data: SharesSoldEvent }
  | { name: 'DividendOpened'; data: DividendOpenedEvent }
  | { name: 'DividendClaimed'; data: DividendClaimedEvent }
  | { name: 'DividendClosed'; data: DividendClosedEvent };