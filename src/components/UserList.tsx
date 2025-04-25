import { useEffect, useState } from 'react';
import { getUserByFid, User } from '../services/api';
import UserCard from './UserCard';

interface UserListProps {
  userIds: number[];
}

const UserList = ({ userIds }: UserListProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const userPromises = userIds.map(fid => getUserByFid(fid));
        const responses = await Promise.all(userPromises);

        const fetchedUsers = responses.map(resp => resp.result.user);
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Failed to fetch users', error);
      } finally {
        setLoading(false);
      }
    };

    if (userIds && userIds.length > 0) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [userIds]);

  if (loading) return <div>Loading members...</div>;

  return (
    <div className="user-list">
      {users.map(user => (
        <UserCard key={user.fid} user={user} />
      ))}
    </div>
  );
};

export default UserList;