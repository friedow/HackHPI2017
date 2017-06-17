from flask import Flask
from flask import jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['SQLALCHEMY_DATABASE_URI']

db = SQLAlchemy(app)
db.engine.execute(text("""SET SCHEMA HPI_2017;"""))


@app.route("/")
def hello():
    sql = text("""SELECT "VALUE" FROM "HPI_2017"."DATAPOINTS" WHERE "KEY" = 'CALORIES' LIMIT 10""")
    result = db.engine.execute(sql)
    names = []
    for row in result:
        names.append(row[0])
    return str(names)

@app.route("/datakeys/")
def datakeys():
    sql = text("""SELECT DISTINCT "KEY" FROM "HPI_2017"."DATAPOINTS" """)
    result = db.engine.execute(sql)
    keys = []
    for row in result:
        keys.append(row[0])
    return jsonify(keys)

@app.route("/users/")
def users():
    sql = text("""SELECT * FROM "HPI_2017"."USERS" """)
    result = db.engine.execute(sql)
    users = []
    for row in result:
        user = {}
        user["ID"] = row[2]
        user["NAME"] = row[0]
        user["BIRTHDAY"] = row[1]
        user["SEX"] = row[3]
        user["HEIGHT"] = row[4]
        users.append(user)
    return jsonify(users)


@app.route("/user/<int:userId>/data/<string:dataKeys>/start/<string:startDate>/end/<string:endDate>")
def data(userId, dataKeys, startDate, endDate):
    keys = "(\'" + "\', \'".join(dataKeys.split("+")) + "\')"
    sql = text("""SELECT "DATE", "KEY", "VALUE" FROM "HPI_2017"."DATAPOINTS" WHERE "USER" = {0} AND "DATE" >= '{1}' AND "DATE" <= '{2}' AND "KEY" IN {3} """.format(userId, startDate, endDate, keys))
    result = db.engine.execute(sql)
    dateDictionary = {}
    for row in result:
        dateKey = row[0].toordinal()
        if dateKey not in dateDictionary:
            dateDictionary[dateKey] = {"date": row[0].strftime("%Y-%m-%d")}
        dateDictionary[row[0].toordinal()][row[1]] = row[2]

    return jsonify(dateDictionary.values())





#@app.route("/user/<int:userId>")
app.run(debug=True, port=4200, host="0.0.0.0")
