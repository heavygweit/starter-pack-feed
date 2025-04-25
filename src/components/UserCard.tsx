import { Link } from 'react-router-dom';
import { User } from '../services/api';

interface UserCardProps {
  user: User;
}

const UserCard = ({ user }: UserCardProps) => {
  return (
    <Link to={`/user/${user.fid}`}>
      <div className="user-card">
        <img src={user.pfp.url} alt={user.displayName} className="profile-pic" />
        <div className="user-info">
          <h4>{user.displayName}</h4>
          <div className="username">@{user.username}</div>
        </div>
      </div>
    </Link>
  );
};

export default UserCard;