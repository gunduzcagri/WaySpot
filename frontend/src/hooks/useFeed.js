import { useInfiniteQuery } from '@tanstack/react-query';
import { feedService } from '../services/feedService';

export const useFeed = (filterParams) => {
  return useInfiniteQuery({
    queryKey: ['feed', filterParams],
    queryFn: ({ pageParam = 1 }) => feedService.getFeed({ ...filterParams, page: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1
  });
};
