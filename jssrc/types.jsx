import PropTypes from 'prop-types';

export const MethodType = PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    notation: PropTypes.string,
    method_set: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        stage: PropTypes.number
    })
});