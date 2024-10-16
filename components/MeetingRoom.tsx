import { cn } from "@/lib/utils";
import { CallControls, CallParticipantsList, CallStatsButton, CallingState, PaginatedGridLayout, SpeakerLayout, useCallStateHooks } from "@stream-io/video-react-sdk";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutList, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import EndCallButton from "./EndCallButton";
import Loader from "./Loader";


type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {

  // Using Next.js useSearchParams to get the URL search params.
  const searchParams = useSearchParams();
  // Check if the meeting is a personal room by checking the 'personal' search param.
  const isPersonalRoom = !!searchParams.get('personal');

  // State for managing the layout type of the call.
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');

  // State for managing visibility of the participants list.
  const [showParticipants, setshowParticipants] = useState(false)

  // Initializing router for leaving the call 
  const router = useRouter();

  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if(callingState !== CallingState.JOINED) return <Loader />

  // Function to render the layout based on the selected type.
  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        // Render grid layout if 'grid' is selected.
        return <PaginatedGridLayout />
      case 'speaker-right':
        // Render speaker layout with participants bar on the left.
        return <SpeakerLayout participantsBarPosition="left" />
      default:
        // Default case is speaker layout with participants bar on the right.
        return <SpeakerLayout participantsBarPosition="right" />
    }
  }

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          {/* Render the selected layout */}
          <CallLayout />
        </div>
        {/* Render the participants list conditionally based on state */}
        <div className={cn('h-[calc(100vh-86px)] hidden ml-2', { 'show-block': showParticipants })}>
          <CallParticipantsList onClose={() => setshowParticipants(false)} />
        </div>
      </div>

      {/* Bottom control bar for call controls, layouts, and participants */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 flex-wrap">
        {/* Call control buttons (mute, video, etc.) */}
        <CallControls onLeave={() => router.push('/')}/>

        {/* Dropdown for changing the call layout (grid, speaker-left, speaker-right) */}
        <DropdownMenu>
          <div className="flex items-center">
            {/* Dropdown trigger button for layouts */}
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              <LayoutList
                size={20}
                className="text-white"
              />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
            {/* Dropdown menu items for different layouts */}
            {['Grid','Speaker-Left','Speaker-Right'].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem className="cursor-pointer"
                  onClick={() => {
                    // Set layout state based on the selected dropdown item
                    setLayout(item.toLowerCase() as CallLayoutType)
                  }}
                >
                  {item}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-dark-1"/>
              </div>
            ))}            
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Button to show statistics of the call */}
        <CallStatsButton />

        {/* Toggle button to show or hide participants list */}
        <button onClick={() => setshowParticipants((prev) => !prev)} aria-label="Toggle participants view">
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <Users size={20} className="text-white" />
          </div>
        </button>

        {/* End call button only shows if it's not a personal room */}
        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  )
}
export default MeetingRoom
