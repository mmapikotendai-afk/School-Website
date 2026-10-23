// Transport-level 429/503 responses cannot be returned as Server Action state.
export function withRetryMessage(action){return async(...args)=>{try{return await action(...args);}catch(error){if(error?.digest?.startsWith('NEXT_REDIRECT'))throw error;return {error:'The request could not be completed. If you have made several attempts, wait a few minutes before trying again.'};}};}
