import jsonata from 'jsonata';

// JSONata transaction expression to transform data
export const txExpression = jsonata(`
  (
    $account := account;
    $transfer := nativeTransfers[fromUserAccount = $account or toUserAccount = $account][0];
    $tokenTransfer := tokenTransfers[fromUserAccount = $account or toUserAccount = $account][0];
    $.{
      "address": account,
      "block_number": slot,
      "chain_uuid": "37a04ca7-c162-482e-b73c-3614af1c667f",
      "from": (
        (type = 'TRANSFER' or type = 'UNKNOWN') and ($transfer or $tokenTransfer) ? (
          $isOutgoing := $transfer.fromUserAccount = $account or $tokenTransfer.fromUserAccount = $account;
          $isOutgoing ? $account : (
            $exists($transfer.fromUserAccount) ? $transfer.fromUserAccount :
            $exists($tokenTransfer.fromUserAccount) ? $tokenTransfer.fromUserAccount :
            null
          )
        ) : null
      ),
      "hash": signature,
      "input": $string(instructions),
      "is_manual": false,
      "is_transferring_native_asset": type = 'TRANSFER' and $transfer,
      "protocol_uuid": protocolUUID,
      "reviewed_status": false,
      "timestamp": timestamp,
      "to": (
        (type = 'TRANSFER' or type = 'UNKNOWN') and ($transfer or $tokenTransfer) ? (
          $isOutgoing := $transfer.fromUserAccount = $account or $tokenTransfer.fromUserAccount = $account;
          $isOutgoing ? (
            $exists($transfer.toUserAccount) ? $transfer.toUserAccount :
            $exists($tokenTransfer.toUserAccount) ? $tokenTransfer.toUserAccount :
            null
          ) : $account
        ) : null
      ),
      "type": type,
      "fees": fee/1000000000,
      "is_edited": false,
      "value": (
        (type = 'TRANSFER' or type = 'UNKNOWN') and ($transfer or $tokenTransfer) ? (
            $exists($transfer.amount) ? $transfer.amount/1000000000 :
            $exists($tokenTransfer.tokenAmount) ? $tokenTransfer.tokenAmount :
            null
        ) : null
      )
    }
  )
`);
