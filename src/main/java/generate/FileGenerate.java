package generate;

import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.Velocity;
import util.GenerateUtil;

import java.io.*;
import java.util.ArrayList;
import java.util.List;


public class FileGenerate {

    public static void main(String args[]){
        start();
    }

    public static void start(){
        VelocityContext context = new VelocityContext();
        context.put("name", "111");//替换文本
        //创建文件
        List<String> templates = GenerateUtil.getTemplates(); //模板所在路径
        for(String template : templates){
            createFile(context,template);
        }
    }

    public static void createFile(VelocityContext context,String template){
        StringWriter sw = new StringWriter();
        Template tpl = Velocity.getTemplate(template , "utf-8");

        tpl.merge(context, sw);
        System.out.println(sw.toString());

        String outPath = "C:/Users/WayneChou/Desktop/Controller.java";
        BufferedWriter fw = null;//解决乱码
        try {
            fw = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(outPath), "UTF-8"));
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        PrintWriter pw = new PrintWriter(fw);
        pw.println(sw.toString());
        pw.flush();
        pw.close();
    }

}
