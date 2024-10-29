import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './Home.css';

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiKey = '467e4ae5';
  const searchQuery = 'avengers';

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(
          `http://www.omdbapi.com/?s=${searchQuery}&apikey=${apiKey}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        if (result.Response === "False") {
          throw new Error(result.Error);
        }

        // Fetch detailed info for each movie to get the IMDb rating
        const moviesWithDetails = await Promise.all(
          result.Search.map(async (movie) => {
            const detailsResponse = await fetch(
              `http://www.omdbapi.com/?i=${movie.imdbID}&apikey=${apiKey}`
            );
            const details = await detailsResponse.json();
            return { ...movie, ...details };
          })
        );

        setMovies(moviesWithDetails);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [apiKey, searchQuery]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="home">
      <h2>IMDb Ratings for Avengers Movies</h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={movies}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Title" />
            <YAxis label={{ value: 'IMDb Rating', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="imdbRating" fill="#8884d8" name="IMDb Rating" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2>Movie List</h2>
      <div className="movie-list">
        {movies.map((movie) => (
          <div key={movie.imdbID} className="movie-item">
            <Link to={`/movie/${movie.imdbID}`}>
              <img src={movie.Poster} alt={movie.Title} className="movie-poster" />
              <div className="movie-info">
                <h3>{movie.Title}</h3>
                <p>Year: {movie.Year}</p>
                <p>IMDb Rating: {movie.imdbRating}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
