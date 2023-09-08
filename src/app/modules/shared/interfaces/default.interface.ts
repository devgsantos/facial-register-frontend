export interface iLogin {
    username: string
    password: string
}

export interface iPersonSave {
  accessEndDatetime: string
  accessStartDatetime: string
  cardNumber: string
  documentNumber: string
  jokerList: iJokerList[]
  email: string
  groupList: string[]
  name: string
  photo: string
  twoFactorAuthentication: boolean
  usersChildrenList: string[]
}

export interface iUserparams {
  tipoIngresso: string
  nome: string
  dataNascimento: string
  localizador: string
  idBilhete: string
  dataCheckin: string
  cpf: string
}

export interface iJokerList {
  tipoIngresso: string
  nome: string
  dataNascimento: string
  localizador: string
  idBilhete: string
  dataCheckin: string
  foto: string
  comprovanteResidencia: string
  dependentes: iDependente[]
}

export interface iDependente {
  nome: string
  dataNascimento: string
  cpf: string
  foto: string
}

export interface iDocumento {
  key: string
  representacaoArquivo: string
}

export interface iFileManagerError {
  errors: Error[]
}

export interface Error {
  object: string
  field: string
  'rejected-value': any
  message: string
}

export interface iDecryptRequest {
  token: string
}

export interface iDefaultResponse {
  status: boolean
  message: string
  dados?: iUserparams | string | iPartialTicketItem[]
}

export interface iDados {
  tipoIngresso: string
  nome: string
  dataNascimento: string
  localizador: string
  idBilhete: string
  dataCheckin: string
  iat: number
  exp: number
}

export interface iTicket {
  tipoIngresso: string
  nome: string
  dataNascimento: string
  localizador: string
  idBilhete: string
  dataCheckin: string
  cpf: string
  token: string
  utilizadores: iUtilizadores[]
}

export interface iUtilizadores {
  nome: string
  dataNascimento: string
  cpf: string
  foto: string
  fotoFile: string
  dataCheckin: string
  localizador: string
  idBilhete: string
  tipoIngresso: string
  comprovanteResidencia: string
  comprovanteBase64: string
}

export interface iChekTicket {
  localizador: string
  cpfTitular: string[]
}

export interface iPartialTicketItem {
  localizador: string
  nomeTitular: string
  cpfTitular: string
  dataCheckin: string
  dataNascimentoTitular: string
  idBilheteTitular: string
  tipoIngresso: string
  idBilhete: string
  nome: string
  dataNascimento: string
  cpf: string
  foto: string
  comprovanteResidencia: string
  dataUpdateBilhete: string
  token: string
  unikeId: string
}