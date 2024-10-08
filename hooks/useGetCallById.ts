import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";

// Custom hook to get a call by its ID using Stream Video Client
export const useGetCallById = (id: string | string[]) => {
    // State to store the Call object when fetched
    const [call, setCall] = useState<Call>();

    // State to track whether the call is still loading
    const [isCallLoading, setIsCallLoading] = useState(true);

    // Get the Stream Video Client instance from the SDK
    const client = useStreamVideoClient();

    // Effect to fetch call details when the client or id changes
    useEffect(() => {
        // Return early if client is not available yet
        if(!client) return;

        // Async function to load the call by its ID
        const loadCall = async () => {
            // Query the calls from the Stream Video API using the given ID
            const { calls } = await client.queryCalls({
                filter_conditions: {
                    id // Filter by the call ID
                }
            });

            // If the call exists, set it in the state
            if (calls.length > 0) setCall(calls[0]);

            // Mark that the call has finished loading
            setIsCallLoading(false);
        };

        // Call the loadCall function
        loadCall();
    }, [client, id]); // Dependencies: re-run the effect if client or id changes

    // Return the call object and loading status
    return { call, isCallLoading };
};
