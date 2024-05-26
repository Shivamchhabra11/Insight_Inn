//@ts-nocheck
"use client"
import { useGetCalls } from '@/hooks/useGetCalls'
import { Call, CallRecording } from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import MeetingCard from './MeetingCard';
import Loader from './Loader';
import { useToast } from './ui/use-toast';

const CallList = ({type}: {type:'ended' | 'upcoming' | 'recordings'}) => {

    const { endedCalls, upcomingCalls, callRecordings, isLoading} = useGetCalls();
    const router = useRouter();

    const [recordings, setRecordings] = useState<CallRecording[]>([])

    const { toast } = useToast();

    const getCalls = ()=>{
        switch (type) {
            case 'ended':
                return endedCalls;
            case 'recordings':
                return recordings;
            case 'upcoming':
                return upcomingCalls;
        
            default:
                return [];
        }
    }

    const getNoCallsMessage = ()=>{
        switch (type) {
            case 'ended':
                return 'no previous calls';
            case 'recordings':
                return 'no recordings';
            case 'upcoming':
                return 'no upcoming calls';
        
            default:
                return '';
        }
    }

    useEffect(()=>{
        
        // try {

            const fetchRecordings = async ()=>{
                const callData = await Promise.all(callRecordings?.map((meeting)=> meeting.queryRecordings())?? [],);
    
                const recordings = callData.filter((call) => call.recordings.length > 0)
                .flatMap((call )=> call.recordings)
                setRecordings(recordings);
    
            }
        // } catch (error) {
        //     toast({title: 'Try again later'})

            
        // } 
        if(type === 'recordings') 
            { 
                fetchRecordings();

            }

    },[type, callRecordings])

    const calls = getCalls();
    const noCallsMessage = getNoCallsMessage();

    if(isLoading) return <Loader/>

  return (
    <div className='grid grid-cols-1 gap-5 xl:grid-cols-2'>
        {calls && calls.length >0 ? calls.map((meeting: Call | CallRecording)=>
        (
            <MeetingCard 
            key={(meeting as Call).id}
            icon={
                type==='ended'
                ? '/icons/previous.svg'
                : type === 'upcoming'
                ? '/icons/upcoming.svg'
                : '/icons/recordings.svg'
            }
            title={(meeting as Call).state?.custom?.description?.substring(0,20) || meeting?.filename?.substring(0, 20) || 'Personal Meeting'}
            date={
                (meeting as Call).state?.startsAt?.toLocaleString() ||
                (meeting as CallRecording).start_time?.toLocaleString()
              }
            isPreviousMeeting={type === 'ended'}
            buttonIcon1={type === 'recordings' ? '/icons/play.svg': undefined}
            buttonText={type === 'recordings' ? 'Play': 'Start'}
            handleClick={
                type === 'recordings'
                  ? () => router.push(`${(meeting as CallRecording).url}`)
                  : () => router.push(`/meeting/${(meeting as Call).id}`)
              }
            link={type === 'recordings' ? meeting.url : `${process.env.NEXT_PUBLIC_BASE_URL}/meetings/${meeting.id}`}
            
            />
        )):(
            <h1>{noCallsMessage}</h1>
        )}
    </div>
  )
}

export default CallList