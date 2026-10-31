type Payload<T> = T extends { data: infer Data } ? Data : T

// Native records/arrays are direct; catalog responses retain a data envelope.
export function payload<T>(response: T): Payload<T> {
  return (response && typeof response === "object" && "data" in response ? response.data : response) as Payload<T>
}

export async function load<T>(request: () => Promise<T>): Promise<Payload<T> | undefined> {
  try {
    return payload(await request())
  } catch {
    return undefined
  }
}
