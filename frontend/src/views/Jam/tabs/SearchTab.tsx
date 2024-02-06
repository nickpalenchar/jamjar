import { Input } from '@chakra-ui/react';
import React, { ChangeEvent, useState } from 'react';
import { FC } from 'react';
import { SongCard } from '../../../components/SongCard';
import { debounce } from 'remeda';

export const SearchTab: FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<number[]>([]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    debouncedSearch.cancel();
    debouncedSearch.call(event.target.value);
  };

  const handleSearch = async (query: string) => {
    console.log('checking ', query);
    if (query.length < 3) {
      return;
    }
    try {
      const response = await fetch(`/api/spotify/search?q=${query}`);
      const data = await response.json();
      console.log(data);
      setResults(data.tracks.items);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const debouncedSearch = debounce(handleSearch, {
    waitMs: 600,
    timing: 'leading',
  });

  // TODO cancel the debounced search etc

  return (
    <>
      <Input
        placeholder="Search..."
        size="lg"
        variant="flushed"
        onChange={handleInputChange}
        value={query}
      ></Input>
      {results.map((result, i: number) => (
        <SongCard key={i.toString()} />
      ))}
    </>
  );
};
