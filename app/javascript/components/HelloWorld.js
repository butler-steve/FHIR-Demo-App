import React from "react"
import PropTypes from "prop-types"

const HelloWorld = React.memo(({greeting}) =>
  <>
    Greeting: {greeting}
  </>
);

HelloWorld.propTypes = {
  greeting: PropTypes.string
};

export default HelloWorld
