export interface User {
  id: string;
  username: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Credential {
  id: string;
  user_id: string;
  credential_id: string;
  public_key: string;
  counter: number;
  device_type: string | null;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

export interface TempChallenge {
  id: string;
  challenge: string;
  user_data: string | null;
  created_at: string;
}
