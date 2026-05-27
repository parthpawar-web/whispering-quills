export interface Story {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  category: string;
  summary: string;
  content: string;
  coverImage: string;
  likes: number;
  comments: number;
  readTime: string;
  publishedAt: string;
  tags: string[];
  featured?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  stories: number;
  followers: number;
  following: number;
  joinedAt: string;
}

export const categories = [
  "Fantasy", "Romance", "Mystery", "Adventure", "Fairy Tale",
  "Horror", "Sci-Fi", "Historical", "Children", "Poetry"
];

export const dummyUsers: User[] = [];

export const dummyStories: Story[] = [];

export const adminStats = {
  totalUsers: 0,
  totalStories: 0,
  totalComments: 0,
  newUsersThisMonth: 0,
  newStoriesThisMonth: 0,
  activeUsers: 0,
};
