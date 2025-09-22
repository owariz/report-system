import PropTypes from 'prop-types';

const Card = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {title && (
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Card;
