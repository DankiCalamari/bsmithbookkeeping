module.exports = (sequelize) => {
    const Invoice = sequelize.define('Invoice', {
        customerName: { type: DataTypes.STRING, allowNull: false },
        totalAmount: { type: DataTypes.FLOAT, allowNull: false },
        dueDate: { type: DataTypes.DATE, allowNull: false },
        filePath: { type: DataTypes.STRING }
    });
    return Invoice;
};
