import { Pool } from 'pg';
import { protocolUUIDMap } from './mockData';
import { OctavTransaction, octavTransactionColumns } from './types';
import format from 'pg-format';
import dotenv from "dotenv";

dotenv.config();

const pgPool = new Pool({
  user: process.env.PG_USERNAME,
  host: process.env.PG_HOSTNAME,
  database: process.env.PG_DBNAME,
  password: process.env.PG_PASSWORD,
  port: 5432,
});

export async function initPostgresDB(): Promise<void> {
  const pgClient = await pgPool.connect();
  try {
    const createTransactionsTableQuery = `
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      CREATE TABLE IF NOT EXISTS transactions (
        uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        address text,
        block_number int4,
        chain_uuid uuid,
        "from" text,
        hash text,
        input text,
        is_error int2,
        is_manual boolean,
        is_transferring_native_asset boolean,
        protocol_position_uuid uuid,
        protocol_uuid uuid,
        reviewed_status text,
        sub_protocol_uuid uuid,
        timestamp int4,
        "to" text,
        type text,
        user_uuid uuid,
        function_name text,
        method_id text,
        created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
        created_by text DEFAULT CURRENT_USER,
        modified_at timestamptz,
        modified_by text,
        is_edited boolean,
        closed_pnl numeric,
        fees numeric(100),
        fees_fiat numeric,
        gas_price numeric,
        gas_used numeric,
        value numeric(100),
        value_fiat numeric,
        user_protocol_uuid uuid,
        edited_at timestamptz,
        UNIQUE (address, hash)
      );
    `;

    const createProtocolsTableAndDataQuery = `
      CREATE TABLE IF NOT EXISTS protocols (
        uuid uuid PRIMARY KEY,
        name text UNIQUE
      );

      INSERT INTO protocols (name, uuid) VALUES
      ('FORM_FUNCTION', '` + protocolUUIDMap['FORM_FUNCTION'] + `'),
      ('EXCHANGE_ART', '` + protocolUUIDMap['EXCHANGE_ART'] + `'),
      ('CANDY_MACHINE_V3', '` + protocolUUIDMap['CANDY_MACHINE_V3'] + `'),
      ('CANDY_MACHINE_V2', '` + protocolUUIDMap['CANDY_MACHINE_V2'] + `'),
      ('CANDY_MACHINE_V1', '` + protocolUUIDMap['CANDY_MACHINE_V1'] + `'),
      ('UNKNOWN', '` + protocolUUIDMap['UNKNOWN'] + `'),
      ('SOLANART', '` + protocolUUIDMap['SOLANART'] + `'),
      ('SOLSEA', '` + protocolUUIDMap['SOLSEA'] + `'),
      ('MAGIC_EDEN', '` + protocolUUIDMap['MAGIC_EDEN'] + `'),
      ('HOLAPLEX', '` + protocolUUIDMap['HOLAPLEX'] + `'),
      ('METAPLEX', '` + protocolUUIDMap['METAPLEX'] + `'),
      ('OPENSEA', '` + protocolUUIDMap['OPENSEA'] + `'),
      ('SOLANA_PROGRAM_LIBRARY', '` + protocolUUIDMap['SOLANA_PROGRAM_LIBRARY'] + `'),
      ('ANCHOR', '` + protocolUUIDMap['ANCHOR'] + `'),
      ('PHANTOM', '` + protocolUUIDMap['PHANTOM'] + `'),
      ('SYSTEM_PROGRAM', '` + protocolUUIDMap['SYSTEM_PROGRAM'] + `'),
      ('STAKE_PROGRAM', '` + protocolUUIDMap['STAKE_PROGRAM'] + `'),
      ('COINBASE', '` + protocolUUIDMap['COINBASE'] + `'),
      ('CORAL_CUBE', '` + protocolUUIDMap['CORAL_CUBE'] + `'),
      ('HEDGE', '` + protocolUUIDMap['HEDGE'] + `'),
      ('LAUNCH_MY_NFT', '` + protocolUUIDMap['LAUNCH_MY_NFT'] + `'),
      ('GEM_BANK', '` + protocolUUIDMap['GEM_BANK'] + `'),
      ('GEM_FARM', '` + protocolUUIDMap['GEM_FARM'] + `'),
      ('DEGODS', '` + protocolUUIDMap['DEGODS'] + `'),
      ('BSL', '` + protocolUUIDMap['BSL'] + `'),
      ('YAWWW', '` + protocolUUIDMap['YAWWW'] + `'),
      ('ATADIA', '` + protocolUUIDMap['ATADIA'] + `'),
      ('DIGITAL_EYES', '` + protocolUUIDMap['DIGITAL_EYES'] + `'),
      ('HYPERSPACE', '` + protocolUUIDMap['HYPERSPACE'] + `'),
      ('TENSOR', '` + protocolUUIDMap['TENSOR'] + `'),
      ('BIFROST', '` + protocolUUIDMap['BIFROST'] + `'),
      ('JUPITER', '` + protocolUUIDMap['JUPITER'] + `'),
      ('MERCURIAL', '` + protocolUUIDMap['MERCURIAL'] + `'),
      ('SABER', '` + protocolUUIDMap['SABER'] + `'),
      ('SERUM', '` + protocolUUIDMap['SERUM'] + `'),
      ('STEP_FINANCE', '` + protocolUUIDMap['STEP_FINANCE'] + `'),
      ('CROPPER', '` + protocolUUIDMap['CROPPER'] + `'),
      ('RAYDIUM', '` + protocolUUIDMap['RAYDIUM'] + `'),
      ('ALDRIN', '` + protocolUUIDMap['ALDRIN'] + `'),
      ('CREMA', '` + protocolUUIDMap['CREMA'] + `'),
      ('LIFINITY', '` + protocolUUIDMap['LIFINITY'] + `'),
      ('CYKURA', '` + protocolUUIDMap['CYKURA'] + `'),
      ('ORCA', '` + protocolUUIDMap['ORCA'] + `'),
      ('MARINADE', '` + protocolUUIDMap['MARINADE'] + `'),
      ('STEPN', '` + protocolUUIDMap['STEPN'] + `'),
      ('SENCHA', '` + protocolUUIDMap['SENCHA'] + `'),
      ('SAROS', '` + protocolUUIDMap['SAROS'] + `'),
      ('ENGLISH_AUCTION', '` + protocolUUIDMap['ENGLISH_AUCTION'] + `'),
      ('FOXY', '` + protocolUUIDMap['FOXY'] + `'),
      ('HADESWAP', '` + protocolUUIDMap['HADESWAP'] + `'),
      ('FOXY_STAKING', '` + protocolUUIDMap['FOXY_STAKING'] + `'),
      ('FOXY_RAFFLE', '` + protocolUUIDMap['FOXY_RAFFLE'] + `'),
      ('FOXY_TOKEN_MARKET', '` + protocolUUIDMap['FOXY_TOKEN_MARKET'] + `'),
      ('FOXY_MISSIONS', '` + protocolUUIDMap['FOXY_MISSIONS'] + `'),
      ('FOXY_MARMALADE', '` + protocolUUIDMap['FOXY_MARMALADE'] + `'),
      ('FOXY_COINFLIP', '` + protocolUUIDMap['FOXY_COINFLIP'] + `'),
      ('FOXY_AUCTION', '` + protocolUUIDMap['FOXY_AUCTION'] + `'),
      ('CITRUS', '` + protocolUUIDMap['CITRUS'] + `'),
      ('ZETA', '` + protocolUUIDMap['ZETA'] + `'),
      ('ELIXIR', '` + protocolUUIDMap['ELIXIR'] + `'),
      ('ELIXIR_LAUNCHPAD', '` + protocolUUIDMap['ELIXIR_LAUNCHPAD'] + `'),
      ('CARDINAL_RENT', '` + protocolUUIDMap['CARDINAL_RENT'] + `'),
      ('CARDINAL_STAKING', '` + protocolUUIDMap['CARDINAL_STAKING'] + `'),
      ('BPF_LOADER', '` + protocolUUIDMap['BPF_LOADER'] + `'),
      ('BPF_UPGRADEABLE_LOADER', '` + protocolUUIDMap['BPF_UPGRADEABLE_LOADER'] + `'),
      ('SQUADS', '` + protocolUUIDMap['SQUADS'] + `'),
      ('SHARKY_FI', '` + protocolUUIDMap['SHARKY_FI'] + `'),
      ('OPEN_CREATOR_PROTOCOL', '` + protocolUUIDMap['OPEN_CREATOR_PROTOCOL'] + `'),
      ('BUBBLEGUM', '` + protocolUUIDMap['BUBBLEGUM'] + `'),
      ('NOVA', '` + protocolUUIDMap['NOVA'] + `'),
      ('D_READER', '` + protocolUUIDMap['D_READER'] + `'),
      ('RAINDROPS', '` + protocolUUIDMap['RAINDROPS'] + `'),
      ('W_SOL', '` + protocolUUIDMap['W_SOL'] + `'),
      ('DUST', '` + protocolUUIDMap['DUST'] + `'),
      ('SOLI', '` + protocolUUIDMap['SOLI'] + `'),
      ('USDC', '` + protocolUUIDMap['USDC'] + `'),
      ('FLWR', '` + protocolUUIDMap['FLWR'] + `'),
      ('HDG', '` + protocolUUIDMap['HDG'] + `'),
      ('MEAN', '` + protocolUUIDMap['MEAN'] + `'),
      ('UXD', '` + protocolUUIDMap['UXD'] + `'),
      ('SHDW', '` + protocolUUIDMap['SHDW'] + `'),
      ('POLIS', '` + protocolUUIDMap['POLIS'] + `'),
      ('ATLAS', '` + protocolUUIDMap['ATLAS'] + `'),
      ('USH', '` + protocolUUIDMap['USH'] + `'),
      ('TRTLS', '` + protocolUUIDMap['TRTLS'] + `'),
      ('RUNNER', '` + protocolUUIDMap['RUNNER'] + `'),
      ('INVICTUS', '` + protocolUUIDMap['INVICTUS'] + `')
      ON CONFLICT (name) DO NOTHING;
    `
    await pgClient.query(createTransactionsTableQuery);
    console.log('Table "transactions" has been created or already exists.');
    await pgClient.query(createProtocolsTableAndDataQuery);
    console.log('Table "protocols" has been created with data or already exists.');
  } catch (err) {
    console.error('Error seeding DB:', err);
  } finally {
    pgClient.release();
  }
}

export async function addTransactionsToPg(data: OctavTransaction[]): Promise<void> {
  const pgClient = await pgPool.connect();
  try {
    // await pgConn.connect();
    const values = data.map(item => [
      item.address,
      item.block_number,
      item.chain_uuid,
      item.from,
      item.hash,
      item.input,
      item.is_manual,
      item.is_transferring_native_asset,
      item.protocol_uuid,
      item.reviewed_status,
      item.timestamp,
      item.to,
      item.type,
      item.fees,
      item.is_edited,
      item.value
    ]);
    const insertQuery = format(`
      INSERT INTO transactions (%I, %I, %I, %I, %I, %I, %I, %I, %I, %I, %I, %I, %I, %I, %I, %I)
      VALUES %L
      ON CONFLICT (address, hash) DO NOTHING
    `, ...octavTransactionColumns, values);
    if (values.length > 0) {
      await pgClient.query('BEGIN');
      await pgClient.query(insertQuery);
      await pgClient.query('COMMIT');
      console.log('Transactions added to the PG table.');
    } else {
      console.log('Nothing to add to the DB')
    }
  } catch (err) {
    console.error('Error inserting into the table:', err);
  } finally {
    pgClient.release();
  }
}
