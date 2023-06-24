import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { useAuth } from "./auth-context";
import { usersReducer, initialUsersState } from "../reducers/usersReducer";
import { actionTypes } from "../utils/constants";
import {
  addBookmarkService,
  followUserService,
  getAllBookmarksService,
  getAllUsersService,
  getUserByUsernameService,
  removeBookmarkService,
  unfollowUserService,
} from "../services/usersServices";
import { toast } from "react-hot-toast";

export const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
  const { token, setCurrentUser } = useAuth();

  const [usersState, usersDispatch] = useReducer(
    usersReducer,
    initialUsersState
  );
  const [isLoading, setIsLoading] = useState(false);

  const {
    GET_ALL_USERS,
    GET_ALL_BOOKMARKS,
    ADD_BOOKMARK,
    REMOVE_BOOKMARK,
    GET_ONE_USER,
    UPDATE_FOLLOW_USER,
  } = actionTypes;

  const getAllUsers = async () => {
    setIsLoading(true);
    try {
      const {
        status,
        data: { users },
      } = await getAllUsersService();
      if (status === 200) {
        usersDispatch({ type: GET_ALL_USERS, payload: users });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserByUsername = async (username) => {
    setIsLoading(true);
    try {
      const {
        status,
        data: { user },
      } = await getUserByUsernameService(username);
      if (status === 200) {
        usersDispatch({ type: GET_ONE_USER, payload: user });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAllBookMarks = async () => {
    setIsLoading(true);
    try {
      const {
        status,
        data: { bookmarks },
      } = await getAllBookmarksService(token);
      if (status === 200) {
        usersDispatch({ type: GET_ALL_BOOKMARKS, payload: bookmarks });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const addBookmarkHandler = async (postId) => {
    try {
      const {
        status,
        data: { bookmarks },
      } = await addBookmarkService(postId, token);
      if (status === 200) {
        usersDispatch({ type: ADD_BOOKMARK, payload: bookmarks });
        toast.success("Added to bookmarks.");
      }
    } catch (error) {
      const {
        response: { status },
      } = error;
      if (status === 400) {
        toast.error("Post is already bookmarked.");
      } else {
        console.error(error);
        toast.error("Something went wrong!");
      }
    }
  };

  const removeBookmarkHandler = async (postId) => {
    try {
      const {
        status,
        data: { bookmarks },
      } = await removeBookmarkService(postId, token);
      if (status === 200) {
        usersDispatch({ type: REMOVE_BOOKMARK, payload: bookmarks });
        toast.success("Removed from bookmarks.");
      }
    } catch (error) {
      const {
        response: { status },
      } = error;
      if (status === 400) {
        toast.error("Post not bookmarked yet.");
      } else {
        console.error(error);
        toast.error("Something went wrong!");
      }
    }
  };

  const followUserHandler = async (followUserId) => {
    setIsLoading(true);
    try {
      const {
        status,
        data: { user, followUser },
      } = await followUserService(followUserId, token);
      if (status === 200) {
        usersDispatch({
          type: UPDATE_FOLLOW_USER,
          payload: [followUser, user],
        });
        setCurrentUser(user);
        toast.success(`Followed @${followUser.username}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const unfollowUserHandler = async (followUserId) => {
    setIsLoading(true);
    try {
      const {
        status,
        data: { user, followUser },
      } = await unfollowUserService(followUserId, token);
      if (status === 200) {
        usersDispatch({
          type: UPDATE_FOLLOW_USER,
          payload: [followUser, user],
        });
        setCurrentUser(user);
        toast.success(`Unfollowed @${followUser.username}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const postAlreadyInBookmarks = (postId) =>
    usersState?.bookmarks?.find((id) => id === postId);

  const searchedUsers =
    usersState.searchInput &&
    usersState.users.filter((user) =>
      user.username.toLowerCase().includes(usersState.searchInput.toLowerCase())
    );

  useEffect(() => {
    getAllUsers();
    if (token) {
      getAllBookMarks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <UsersContext.Provider
      value={{
        usersState,
        usersDispatch,
        isLoading,
        addBookmarkHandler,
        removeBookmarkHandler,
        postAlreadyInBookmarks,
        searchedUsers,
        getUserByUsername,
        followUserHandler,
        unfollowUserHandler,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => useContext(UsersContext);
