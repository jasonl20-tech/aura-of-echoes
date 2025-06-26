
import React from 'react';
import { MapPin, Star } from 'lucide-react';

interface Profile {
  id: number;
  name: string;
  age: number;
  interests: string[];
  distance: number;
  image: string;
  description: string;
  personality: string;
  isSubscribed?: boolean;
}

interface ProfileCardProps {
  profile: Profile;
  onClick: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onClick }) => {
  return (
    <div
      className="profile-glass rounded-2xl overflow-hidden cursor-pointer hover-lift group"
      onClick={onClick}
    >
      {/* Image with overlay */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={profile.image}
          alt={profile.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        {/* Subscription badge */}
        {profile.isSubscribed && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-purple-700 px-2 py-1 rounded-lg backdrop-blur-sm">
            <span className="text-xs text-white font-semibold">Abonniert</span>
          </div>
        )}

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center space-x-1 glass px-2 py-1 rounded-lg">
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <span className="text-xs text-white font-medium">4.8</span>
        </div>

        {/* Profile info overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg text-sharp">
            {profile.name}, {profile.age}
          </h3>
          <div className="flex items-center space-x-1 text-white/80 mt-1">
            <MapPin className="w-3 h-3" />
            <span className="text-sm">{profile.distance} km</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Interests */}
        <div className="flex flex-wrap gap-1">
          {profile.interests.slice(0, 3).map((interest, index) => (
            <span
              key={index}
              className="px-2 py-1 glass rounded-full text-xs text-white/80 font-medium"
            >
              {interest}
            </span>
          ))}
          {profile.interests.length > 3 && (
            <span className="px-2 py-1 glass rounded-full text-xs text-white/60">
              +{profile.interests.length - 3}
            </span>
          )}
        </div>

        {/* Description preview */}
        <p className="text-white/70 text-sm leading-relaxed line-clamp-2">
          {profile.description}
        </p>
      </div>
    </div>
  );
};

export default ProfileCard;
