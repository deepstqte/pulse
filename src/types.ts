export interface AddressResult {
  newlySynced: number,
  total: number
}

// Always keep the OctavTransaction interface and octavTransactionColumns list consistent
export interface OctavTransaction {
  address: string;
  block_number: number;
  chain_uuid: string;
  from: string | null;
  hash: string;
  input: string;
  is_manual: boolean;
  is_transferring_native_asset: boolean;
  protocol_uuid: string;
  reviewed_status: boolean;
  timestamp: number;
  to: string | null;
  type: string;
  fees: number;
  is_edited: boolean;
  value: number | null;
}

export const octavTransactionColumns: string[] = [
  "address",
  "block_number",
  "chain_uuid",
  "from",
  "hash",
  "input",
  "is_manual",
  "is_transferring_native_asset",
  "protocol_uuid",
  "reviewed_status",
  "timestamp",
  "to",
  "type",
  "fees",
  "is_edited",
  "value"
];

export interface RawTransaction {
    _id:              ID;
    description:      string;
    type:             Type;
    source:           string;
    fee:              number;
    feePayer:         string;
    signature:        string;
    slot:             number;
    timestamp:        number;
    tokenTransfers:   TokenTransfer[];
    nativeTransfers:  NativeTransfer[];
    accountData:      AccountDatum[];
    transactionError: null;
    instructions:     Instruction[];
    events:           Events;
    account:          string;
    protocolUUID:          string;
}

export interface ID {
    $oid: string;
}

export interface AccountDatum {
    account:             string;
    nativeBalanceChange: number;
    tokenBalanceChanges: TokenBalanceChange[];
}

export interface TokenBalanceChange {
    userAccount:    string;
    tokenAccount:   string;
    rawTokenAmount: RawTokenAmount;
    mint:           string;
}

export interface RawTokenAmount {
    tokenAmount: string;
    decimals:    number;
}

export interface Events {
    compressed?:   Compressed[];
    nft?:          EventsNft;
    setAuthority?: SetAuthority[];
}

export interface Compressed {
    type:                  Type;
    treeId:                string;
    leafIndex:             number;
    seq:                   number;
    assetId:               string;
    instructionIndex:      number;
    innerInstructionIndex: number | null;
    newLeafOwner:          null | string;
    oldLeafOwner:          null | string;
    newLeafDelegate:       string | null;
    oldLeafDelegate:       string | null;
    treeDelegate:          string | null;
    metadata:              Metadata | null;
    updateArgs:            null;
}

export interface Metadata {
    name:                 string;
    symbol:               string;
    uri:                  string;
    sellerFeeBasisPoints: number;
    primarySaleHappened:  boolean;
    isMutable:            boolean;
    editionNonce:         number;
    tokenStandard:        TokenStandard;
    collection:           Collection;
    tokenProgramVersion:  TokenProgramVersion;
    creators:             Creator[];
}

export interface Collection {
    key:      string;
    verified: boolean;
}

export interface Creator {
    address:  string;
    verified: boolean;
    share:    number;
}

export enum TokenProgramVersion {
    Original = "Original",
}

export enum TokenStandard {
    NonFungible = "NonFungible",
}

export enum Type {
    Burn = "BURN",
    CompressedNftMint = "COMPRESSED_NFT_MINT",
    CompressedNftTransfer = "COMPRESSED_NFT_TRANSFER",
    CreateMerkleTree = "CREATE_MERKLE_TREE",
    NftMint = "NFT_MINT",
    Transfer = "TRANSFER",
    Unknown = "UNKNOWN",
}

export interface EventsNft {
    description: string;
    type:        Type;
    source:      string;
    amount:      number;
    fee:         number;
    feePayer:    string;
    signature:   string;
    slot:        number;
    timestamp:   number;
    saleType:    string;
    buyer:       string;
    seller:      string;
    staker:      string;
    nfts:        NftElement[];
}

export interface NftElement {
    mint:          string;
    tokenStandard: TokenStandard;
}

export interface SetAuthority {
    account:               string;
    from:                  string;
    to:                    string;
    instructionIndex:      number;
    innerInstructionIndex: number;
}

export interface Instruction {
    accounts:           string[];
    data:               string;
    programId:          string;
    innerInstructions?: Instruction[];
}

export interface NativeTransfer {
    fromUserAccount: string;
    toUserAccount:   string;
    amount:          number;
}

export interface TokenTransfer {
    fromTokenAccount: string;
    toTokenAccount:   string;
    fromUserAccount:  string;
    toUserAccount:    string;
    tokenAmount:      number;
    mint:             string;
    tokenStandard:    string;
}
