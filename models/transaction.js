module.exports = (sequelize) => {
    const Transaction = sequelize.define('Transaction', {
        description: { type: DataTypes.STRING, allowNull: false },
        amount: { type: DataTypes.FLOAT, allowNull: false },
        date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    });
    return Transaction;
};
