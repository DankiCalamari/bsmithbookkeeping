module.exports = (sequelize) => {
    const Quote = sequelize.define('Quote', {
        text: { type: DataTypes.STRING, allowNull: false },
        author: { type: DataTypes.STRING }
    });
    return Quote;
};
