import type { PipelinePolicy } from '@typespec/ts-http-runtime'

// Create a policy that sets withCredentials on all requests to enable cookie handling
export const credentialsPolicy: PipelinePolicy = {
  name: "credentialsPolicy",
  sendRequest: (request, next) => {
    request.withCredentials = true
    return next(request)
  },
}

// Helper function to create client options with credentials policy
export function getClientOptionsWithCredentials(options?: Record<string, any>) {
  return {
    ...options,
    additionalPolicies: [
      {
        policy: credentialsPolicy,
        position: "perCall" as const,
      },
    ],
  }
}