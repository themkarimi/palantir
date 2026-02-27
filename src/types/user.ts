export interface LocalUser {
  id: string
  email: string
  /** scrypt-hashed password: "<salt>:<hash>" */
  passwordHash: string
  groups: string[]
  createdAt: string
}

export interface Group {
  id: string
  name: string
  description: string
  createdAt: string
}

export interface UsersData {
  users: LocalUser[]
  groups: Group[]
}

export type LocalUserCreateInput = {
  email: string
  password: string
  groups: string[]
}

export type LocalUserUpdateInput = Partial<{
  email: string
  password: string
  groups: string[]
}>

export type GroupCreateInput = {
  name: string
  description: string
}

export type GroupUpdateInput = Partial<GroupCreateInput>
