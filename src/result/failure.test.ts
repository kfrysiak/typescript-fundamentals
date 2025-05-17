import { describe, expect, expectTypeOf, test } from 'vitest'
import { success } from './success'
import { failure } from './failure'

describe("FailureOf",()=>{
    test('returns valid failure from Result', () => {

    function withPayload(){
        if (true as any){
            return failure({
                code:"something_wrong",
                message:"Something went wrong",
                payload: { id: 5}
            })
        }
        return success(true);
    }
      
    const withPayloadResult = withPayload();
    const [successResult,failureResult] = withPayloadResult;
    if (!failureResult){
        throw new Error('Should not happen');
    }
    
    
    })
})