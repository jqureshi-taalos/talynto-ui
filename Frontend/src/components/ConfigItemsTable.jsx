import React, { useState } from "react";

const ConfigItemsTable = ({ section, sectionKey, currentPage, handleEdit, handleDelete, getPaginatedItems }) => {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (id) => {
    if (window.innerWidth < 1024) {
      setOpenMenu(openMenu === id ? null : id);
    }
  };

  return (
    <div className="config-items-grid">
      <table className="config-table">
        <thead>
          <tr>
            <th>Expertise</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {getPaginatedItems(section.items, currentPage[sectionKey] || 1).map((item) => (
            <tr key={item.id}>
              <td className="config-item-name">{item.name}</td>
              <td>
                <span className={`config-item-status ${item.isActive ? '' : 'inactive'}`}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="range">{new Date(item.createdAt).toLocaleDateString()}</td>
              <td className="range">{new Date(item.updatedAt).toLocaleDateString()}</td>
              <td>
                <div className={`actions-menu ${openMenu === item.id ? "open" : ""}`}>
                  <button className="actions-button" onClick={() => toggleMenu(item.id)}>⋮</button>
                  <div className="actions-dropdown">
                    <button onClick={() => handleEdit(sectionKey, item)}>✏ Edit</button>
                    <button onClick={() => handleDelete(sectionKey, item)}>🗑 Delete</button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConfigItemsTable;
