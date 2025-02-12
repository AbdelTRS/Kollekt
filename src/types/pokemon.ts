export type Series = {
  id: number;
  name: string;
  code: string;
  release_year: number;
};

export type Extension = {
  id: number;
  series_id: number;
  name: string;
  code: string;
  release_date: string;
  card_count: number | null;
};

export type Item = {
  id: string;
  type: 'SCELLE' | 'CARTE';
  sub_type?: string;
  language?: 'FR' | 'JAP';
  card_name?: string;
  card_image?: string;
  sealed_image?: string;
  quantity: number;
  collection?: string;
  purchase_price?: number;
  card_purchase_price?: number;
  purchase_date?: string;
  card_purchase_date?: string;
  purchase_location?: string;
  card_purchase_location?: string;
  is_purchased?: boolean;
  series_id?: number;
  extension_id?: number;
};