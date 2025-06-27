import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";

export function Balance() {
  const { address } = useAccount()

  console.log("Balance address getbalances is here", address);

  const { data, isLoading, error } = useBalance({ address })

  console.log("Balance data is here", data);

  return (
    <div>
      <h2>Balance</h2>
      <div>{data?.value !== undefined && `${formatUnits(data.value, data.decimals)} ${data.symbol}`} {isLoading && 'Loading...'} {error && 'Error: ' + error.message}</div>
    </div>
  )
}