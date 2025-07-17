"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Fuse from "fuse.js";
import type { FuseResult } from "fuse.js";

interface Advocate {
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
}

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Common table styles
  const tableHeaderStyle =
    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200";
  const tableCellStyle = "px-6 py-4 whitespace-nowrap text-sm text-gray-900";
  const tableRowStyle = "hover:bg-gray-50 transition-colors duration-200";

  const fuseOptions = {
    keys: [
      "firstName",
      "lastName",
      "city",
      "degree",
      "specialties",
      "yearsOfExperience",
      "phoneNumber",
    ],
    threshold: 0.3,
    includeScore: true,
    ignoreLocation: true,
    findAllMatches: true,
    minMatchCharLength: 2,
  };

  const fuse = useMemo(() => new Fuse(advocates, fuseOptions), [advocates]);

  const debouncedSearch = useCallback(
    (searchValue: string) => {
      if (!searchValue.trim()) {
        setFilteredAdvocates(advocates);
        return;
      }

      try {
        const results = fuse.search(searchValue);
        const filteredAdvocates = results.map(
          (result: FuseResult<Advocate>) => result.item
        );
        setFilteredAdvocates(filteredAdvocates);
      } catch (err) {
        console.error("Error during search:", err);
        setFilteredAdvocates([]);
      }
    },
    [fuse, advocates]
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchValue = e.target.value;
      setSearchTerm(searchValue);

      const timeoutId = setTimeout(() => {
        debouncedSearch(searchValue.trim());
      }, 300);
      return () => clearTimeout(timeoutId);
    },
    [debouncedSearch]
  );

  const onClick = useCallback(() => {
    setFilteredAdvocates(advocates);
    setSearchTerm("");
  }, [advocates]);

  useEffect(() => {
    const fetchAdvocates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("fetching advocates...");

        const response = await fetch("/api/advocates");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonResponse = await response.json();
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      } catch (err) {
        console.error("Error fetching advocates:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch advocates"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdvocates();
  }, []);

  if (isLoading) {
    return (
      <main style={{ margin: "24px" }}>
        <h1>Solace Advocates</h1>
        <p>Loading advocates...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ margin: "24px" }}>
        <h1>Solace Advocates</h1>
        <p style={{ color: "red" }}>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Solace Advocates
      </h1>

      <div className="mb-8">
        <label
          htmlFor="search"
          className="block text-lg font-medium text-gray-700"
        >
          Search Advocates
        </label>
        <div className="flex gap-3">
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={onChange}
            placeholder="Search by name, city, degree, specialties..."
            className="flex-1 py-2 pl-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors placeholder:pl-2"
          />
          <button
            onClick={onClick}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-colors"
          >
            Reset Search
          </button>
        </div>
      </div>

      {filteredAdvocates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No advocates found matching your search.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={tableHeaderStyle}>First Name</th>
                <th className={tableHeaderStyle}>Last Name</th>
                <th className={tableHeaderStyle}>City</th>
                <th className={tableHeaderStyle}>Degree</th>
                <th className={tableHeaderStyle + " w-64"}>Specialties</th>
                <th className={tableHeaderStyle + " w-24"}>
                  Years of Experience
                </th>
                <th className={tableHeaderStyle}>Phone Number</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdvocates.map((advocate) => {
                // Create a unique key using advocate data
                const uniqueKey = `${advocate.firstName}-${advocate.lastName}-${advocate.phoneNumber}`;
                return (
                  <tr key={uniqueKey} className={tableRowStyle}>
                    <td className={tableCellStyle}>{advocate.firstName}</td>
                    <td className={tableCellStyle}>{advocate.lastName}</td>
                    <td className={tableCellStyle}>{advocate.city}</td>
                    <td className={tableCellStyle}>{advocate.degree}</td>
                    <td className={tableCellStyle + " w-64"}>
                      <ul className="list-disc list-inside space-y-1">
                        {advocate.specialties.map(
                          (specialty, specialtyIndex) => (
                            <li
                              key={`${uniqueKey}-specialty-${specialtyIndex}`}
                              className="text-gray-700"
                            >
                              {specialty}
                            </li>
                          )
                        )}
                      </ul>
                    </td>
                    <td className={tableCellStyle + " w-24"}>
                      {advocate.yearsOfExperience}
                    </td>
                    <td className={tableCellStyle}>{advocate.phoneNumber}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
