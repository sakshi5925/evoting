import React from "react";
import ElectionCard from "./ElectionCard";

const ElectionSection = ({ title, data }) => {
  return (
    <section>
      <h2 className="text-3xl font-bold mb-6 border-l-4 border-green-400 pl-4">
        {title}
      </h2>

      {data.length === 0 ? (
        <p className="text-gray-400 ml-4">No elections available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {data.map((election) => (
            <ElectionCard key={election._id} election={election} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ElectionSection;
