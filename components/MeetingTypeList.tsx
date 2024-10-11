"use client"

import { useState } from "react"
import HomeCard from "./HomeCard"
import { useRouter } from "next/navigation"
import MeetingModal from "./MeetingModal"
import { useUser } from "@clerk/nextjs"
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "./ui/textarea"
import ReactDatePicker from 'react-datepicker';

const MeetingTypeList = () => {
    const router = useRouter(); // For navigating between pages
    const [meetingState, setMeetingState] = useState<'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined>();
    // Tracks the state of the meeting type (schedule, instant, or joining)
    const user = useUser(); // Fetch current user details
    const client = useStreamVideoClient(); // Initialize the Stream Video Client

    // Initial state for scheduling meeting values
    const [values, setValues] = useState({
        dateTime: new Date(), // Default to current date and time
        description: '', // Description for the meeting
        link: '' // Link to join the meeting
    });

    // Holds the details of the created call (meeting)
    const [callDetails, setCallDetails] = useState<Call>();

    const { toast } = useToast(); // Hook to show toast notifications

    // Function to create a new meeting
    const createMeeting = async () => {
        if (!client || !user) return; // If client or user is not available, stop

        try {
            // Check if date/time is selected for scheduling
            if (!values.dateTime) {
                toast({ title: "Please select a date and time" });
                return;
            }

            const id = crypto.randomUUID(); // Generate unique ID for the call
            const call = client.call('default', id); // Create a new call using the Stream SDK

            if (!call) throw new Error('Failed to create call'); // Handle case where call creation fails

            // Set meeting start time and description
            const startsAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString();
            const description = values.description || 'Instant Meeting';

            // Create or get the call details on Stream server
            await call.getOrCreate({
                data: {
                    starts_at: startsAt,
                    custom: { description } // Attach description to the call
                }
            });

            setCallDetails(call); // Save call details in state for further use

            // If no description provided, navigate directly to the meeting page
            if (!values.description) {
                router.push(`/meeting/${call.id}`);
            }

            // Show success notification
            toast({ title: "Meeting created successfully" });

        } catch (error) {
            console.log(error); // Log errors
            toast({ title: "Failed to create meeting" }); // Show error notification
        }
    };

    // Meeting link that can be copied by the user
    const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`;

    return (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {/* Card to create an instant meeting */}
            <HomeCard
                img="/icons/add-meeting.svg"
                title="New Meeting"
                description="Start an instant meeting"
                handleClick={() => setMeetingState('isInstantMeeting')}
                className="bg-orange-1"
            />
            {/* Card to schedule a meeting */}
            <HomeCard
                img="/icons/schedule.svg"
                title="Schedule Meeting"
                description="Plan your meeting"
                handleClick={() => setMeetingState('isScheduleMeeting')}
                className="bg-purple-1"
            />

            {/* Card to navigate to the recordings page */}
            <HomeCard
                img="/icons/recordings.svg"
                title="View Recordings"
                description="Checkout your recordings"
                handleClick={() => router.push('/recordings')}
                className="bg-yellow-1"
            />
            {/* Card to join an existing meeting */}
            <HomeCard
                img="/icons/join-meeting.svg"
                title="Join Meeting"
                description="Via invitation Link"
                handleClick={() => setMeetingState('isJoiningMeeting')}
                className="bg-blue-1"
            />

            {/* Conditionally render the modal based on whether a meeting has been created */}
            {!callDetails ? (
                <MeetingModal
                    isOpen={meetingState === 'isScheduleMeeting'} // Open if scheduling a meeting
                    onClose={() => setMeetingState(undefined)} // Close the modal
                    title="Create Meeting" // Modal title
                    handleClick={createMeeting} // Trigger meeting creation
                >
                    {/* Description input field */}
                    <div className="flex flex-col gap-2.5">
                        <label className="text-base text-normal leading-[22px] text-sky-2">Add a description</label>
                        <Textarea
                            className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
                            onChange={(e) => {
                                setValues({ ...values, description: e.target.value });
                            }}
                        />
                    </div>

                    {/* Date and time picker for scheduling */}
                    <div className="flex w-full flex-col gap-2.5">
                        <label className="text-base text-normal leading-[22px] text-sky-2">Select Date and Time</label>
                        <ReactDatePicker
                            selected={values.dateTime} // Current selected date and time
                            onChange={(date) => setValues({ ...values, dateTime: date! })} // Update date/time state
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            timeCaption="time"
                            dateFormat="MMMM d, yyyy h:mm aa"
                            className="w-full rounded bg-dark-3 p-2 focus:outline-none"
                        />
                    </div>
                </MeetingModal>
            ) : (
                // Modal for when a meeting is created successfully
                <MeetingModal
                    isOpen={meetingState === 'isScheduleMeeting'} // Open if meeting is scheduled
                    onClose={() => setMeetingState(undefined)} // Close modal
                    title="Meeting Created" // Modal title
                    className="text-center"
                    handleClick={() => {
                        navigator.clipboard.writeText(meetingLink); // Copy meeting link to clipboard
                        toast({ title: 'Link Copied' }); // Show success notification
                    }}
                    image="/icons/checked.svg" // Icon to indicate success
                    buttonIcon="/icons/copy.svg" // Button icon
                    buttonText="Copy Meeting Link" // Button text
                />
            )}
            
            {/* Modal for starting an instant meeting */}
            <MeetingModal
                isOpen={meetingState === 'isInstantMeeting'} // Open if instant meeting selected
                onClose={() => setMeetingState(undefined)} // Close modal
                title="Start an Instant Meeting" // Modal title
                className="text-center"
                buttonText="Start Meeting" // Button text
                handleClick={createMeeting} // Start meeting instantly
            />
        </section>
    )
}
export default MeetingTypeList;
