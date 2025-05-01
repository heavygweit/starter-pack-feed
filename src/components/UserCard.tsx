import { Link } from 'react-router-dom';
import { User } from '../services/api';

interface UserCardProps {
  user: User;
}

const UserCard = ({ user }: UserCardProps) => {
  return (
    <Link to={`/user/${user.fid}`}>
      <div className="flex items-center bg-white rounded-lg p-3 mb-3 shadow-sm hover:bg-gray-50 cursor-pointer">
        <img 
          src={user.pfp.url} 
          alt={user.displayName} 
          className="w-12 h-12 rounded-full mr-4 object-cover" 
        />
        <div className="flex-1">
          <h4 className="mb-1">{user.displayName}</h4>
          <div className="text-gray-500 text-sm">@{user.username}</div>
        </div>
      </div>
    </Link>
  );
};

export default UserCard;