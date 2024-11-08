export interface ChallengeDetails {
  ipfsUrl: string;
  duration: number;
  startTime: number;
  endTime: number;
  isActive: boolean;
  winner: string;
  prizeAmount: string;
  prizeType: 'ETH' | 'USDC';
  timeRemaining: number;
}

export interface Submission {
  index: number;
  ipfsHash: string;
  submitter: string;
  voteCount: number;
}

export interface SubmissionStats {
  totalSubmissions: number;
  uniqueSubmitters: number;
  totalVotes: number;
  averageVotes: number;
  topSubmission: {
    index: number;
    voteCount: number;
    submitter: string;
  } | null;
}

export interface ApiResponse {
  status: 'success' | 'error';
  data: {
    challenge: ChallengeDetails;
    submissions: Submission[];
    stats: SubmissionStats;
  };
  meta: {
    chain: string;
    contractAddress: string;
    timestamp: string;
  };
}

export interface SubmissionCardProps {
  ipfsHash: string;
  voteCount: number;
  onVote: () => void;
  submitter: string;
  isVoting: boolean;
  chain?: string;
  ipfsUri?: string;
}

export interface SubmissionsHeaderProps {
  challengeName?: string;
  stats?: SubmissionStats;
}
