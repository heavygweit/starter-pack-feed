import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserByFid, User } from '../services/api';

const UserDetail = () => {
  const { fid } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        if (fid) {
          const response = await getUserByFid(Number(fid));
          setUser(response.result.user);
        }
      } catch (err) {
        setError('Failed to load user');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (fid) {
      fetchUser();
    }
  }, [fid]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-detail">
      <div className="user-header">
        <img src={user.pfp.url} alt={user.displayName} className="profile-pic-large" />
        <div className="user-info">
          <h1>{user.displayName}</h1>
          <div className="username">@{user.username}</div>
          {user.bio && <p className="bio">{user.bio}</p>}
          {user.followerCount !== undefined && (
            <div className="stats">
              <span>{user.followerCount} followers</span>
              <span>{user.followingCount} following</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;