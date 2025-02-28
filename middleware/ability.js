const { AbilityBuilder, createMongoAbility } = require('@casl/ability');

module.exports = (req, res, next) => {
  const { can, build } = new AbilityBuilder(createMongoAbility);

  if (req.user.role === 'admin') {
    can('manage', 'all');
  } else {
    // Users can only manage their own resources
    can(['create', 'read'], ['SKU', 'Customer', 'Order'], { createdBy: req.user._id });
    can('read', 'User', { _id: req.user._id });
  }

  req.ability = build();
  next();
};