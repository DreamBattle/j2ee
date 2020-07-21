package generate;


import util.ReadProperties;

import java.sql.*;

public class GenEntityOracle {

    private static String driver = "";
    private static String url = "";
    private static String username = "";
    private static String password = "";

    static {
        ReadProperties readProperties = new ReadProperties("common");
        System.out.println(readProperties.getString("jdbc_driver"));
        System.out.println(readProperties.getString("jdbc_url"));
        System.out.println(readProperties.getString("jdbc_username"));
        System.out.println(readProperties.getString("jdbc_password"));

        driver = readProperties.getString("jdbc_driver");
        url = readProperties.getString("jdbc_url");
        username = readProperties.getString("jdbc_username");
        password = readProperties.getString("jdbc_password");
    }

    public GenEntityOracle(String tablename){

        Connection connection = null;

        try {
            //初始化驱动
            Class.forName(driver);
            System.out.println("数据库驱动加载成功 ！");

            connection = DriverManager.getConnection(url,username,password);
            System.out.println("连接成功，获取连接对象： " + connection);

            Statement statement = connection.createStatement();
            System.out.println("获取 Statement对象： " + statement);

            String sql = "select * from " + tablename;
            ResultSet resultSet = statement.executeQuery(sql);

            System.out.println("执行查询语句成功");


        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        }finally {
            try {
                connection.close();
            } catch (SQLException throwables) {
                throwables.printStackTrace();
            }
        }
    }

    public static void main(String args[]){
        new GenEntityOracle("t_sys_user");
    }

}
