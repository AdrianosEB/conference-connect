export interface UserProfile {
  userId: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  interests: string;
  linkedinUrl: string;
  summary: string;
  skills: string[];
  keywords: string[];
  avatarUrl: string;
}

export interface MatchResult {
  userId: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  summary: string;
  skills: string[];
  avatarUrl: string;
  score: number;
  reasons: string[];
}

export interface ConnectionRequestData {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: string;
  createdAt: string;
  fromUser?: UserProfile;
  toUser?: UserProfile;
}

export interface MessageData {
  id: string;
  threadKey: string;
  fromUserId: string;
  body: string;
  createdAt: string;
  fromUser?: { name: string; avatarUrl: string };
}

export interface PostData {
  id: string;
  userId: string;
  body: string;
  linkUrl: string;
  createdAt: string;
  user?: { name: string; title: string; company: string; avatarUrl: string };
}

export interface ThreadPreview {
  threadKey: string;
  otherUser: UserProfile;
  lastMessage: string;
  lastMessageAt: string;
}
